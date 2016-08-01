import R from 'ramda';
import React from 'react';
import { stripIndent } from 'common-tags';
import { dirname } from 'path';

const FLAG_REPLACE = {
  "'":  "\\'",
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\v': '\\v',
  '\b': '\\b'
};

/**
 * validImageComment :: Object -> String | Undefined
 */
const validImageComment = ({ image }) => {
  if (!image) {
    return '# Could not infer task payload format';
  } else if (R.is(Object, image)) {
    return image.type || image.type === 'task-image' ?
      null :
      '# Failed to infer task payload format';
  } else if (!R.is(String, image)) {
    return '# Failed to infer task payload format';
  }
};

export default ({ taskId, payload }) => {
  /**
   * Note: We ignore cache folders as they will just be empty, which is fine.
   * TODO: Implement support for task.payload.features such as:
   *   - taskclusterProxy
   *   - testdroidProxy
   *   - balrogVPNProxy
   *   We can do this with --link and demonstrate how to inject credentials using environment variables
   *   (Obviously we can provide the credentials)
   */

  const imageComment = validImageComment(payload);

  if (imageComment) {
    return imageComment;
  }

  const commands = [stripIndent`
    #!/bin/bash -e
    # WARNING: this is experimental mileage may vary!
  `, ''];
  const deviceCommands = [];

  if (R.path(['capabilities', 'devices'], payload)) {
    commands.push(stripIndent`
      # Task uses the following devices:
      # ${R.join(', ', R.keys(payload.capabilities.devices))}

      # Warning: This is entirely dependent on local setup and
      # availability of devices.

    `);
  }

  // TODO Add devices other than loopback at some point

  if (R.path(['capabilities', 'devices', 'loopbackVideo'], payload)) {
    commands.push(stripIndent`
      # This job requires access to your video device.
      
      if [[ $(apt-cache search v4l2loopback-dkms | wc -l) -eq 0 ]]; then
        echo 'We are going to install v42loopback-dkms on your host.'
        echo 'If you are OK with it type your root password.'
        sudo apt-get install -qq -f v4l2loopback-dkms
      fi

      if [[ $(lsmod | grep "v4l2loopback" | wc -l) -eq 0 ]]; then
        echo 'We are going to create a video device under /dev/video*'
        echo 'This needs to happen every time after you reboot your machine.'
        echo 'If you are OK with it type your root password.'
        sudo modprobe v4l2loopback
      fi

      last_device=$(ls /dev/video* | tail -n 1)
    `);
    deviceCommands.push(`  --device $last_device:$last_device \\`);
  }

  if (R.path(['capabilities', 'devices', 'loopbackAudio'], payload)) {
    commands.push(stripIndent`
      # This job requires access to your audio device.

      # This command will create virtual devices under /dev/snd*
      # sudo modprobe snd-aloop

      # Adjust the following list of --devices to match your host. Pick the most recently created ones.
    `);
    deviceCommands.push(stripIndent`
      --device /dev/snd/controlC0:/dev/snd/controlC0 \\
      --device /dev/snd/pcmC0D0c:/dev/snd/pcmC0D0c \\
      --device /dev/snd/pcmC0D0p:/dev/snd/pcmC0D0p \\
      --device /dev/snd/pcmC0D1c:/dev/snd/pcmC0D1c \\
      --device /dev/snd/pcmC0D1p:/dev/snd/pcmC0D1p \\
    `);
  }

  // The commands for video device initialization require some user interaction. Let's make sure we don't start
  // downloading the image before user input might be required to prevent the script execution to be halted half-way due
  // to user input being required.

  if (R.is(String, payload.image)) {
    commands.push(stripIndent`
      # Image appears to be a Docker Hub Image. Fetch docker image
      image_name=${payload.image}
      docker pull '${payload.image}'
    `);
  } else if (R.is(Object, payload.image)) {
    const { path, taskId } = payload.image;

    commands.push(stripIndent`
      # Image appears to be a task image
      # Download image tarball from task
      curl -L -o image.tar https://queue.taskcluster.net/v1/task/${taskId}/artifacts/${path}

      # Extract image name and tag from image tarball
      # Note: jq is required. Download the package appropriate
      # for your OS at https://stedolan.github.io/jq
      image=$(tar xf image.tar -O repositories | jq -r 'keys[0]')
      image_tag=$(tar xf image.tar -O repositories | jq -r '.[keys[0]] | keys[0]')
      image_name=$image:$image_tag

      # Load docker image from tarball
      docker load < image.tar
    `);
  }

  commands.push(...['', stripIndent`
    # Find a unique container name
    container_name='task-${taskId}-container'
    
    # Run docker command
    docker run -ti \\
      --name "\${container_name}" \\
  `]);

  if (R.path(['capabilities', 'privileged'], payload)) {
    commands.push('  --privileged \\');
  }

  commands.push(...R.map(([key, value]) => `  -e ${key}='${value}' \\`, R.toPairs(payload.env)));

  // This allows changing behavior on the script to be run to change behavior from production, e.g. start VNC
  commands.push(`  -e RUN_LOCALLY='true' \\`);

  commands.push(...deviceCommands);
  commands.push('  ${image_name} \\');

  if (payload.command) {
    commands.push('');

    // We add a new line between `docker run` and the command to ensure that the container won't execute it and end
    // since we want to allow the developer to interactive with it
    const _SPECIAL = '[\'\\n\\r\\t\\v\\b]';
    const SPECIAL = new RegExp(_SPECIAL);
    const SPECIAL_GLOBAL = new RegExp(_SPECIAL, 'g');
    const replace = R.replace(/\\/g, '\\\\');
    const TEXT = /^[a-zA-Z0-9.,;:/_-]*$/;

    const command = R.map(_command => {
      const command = replace(_command);

      if (R.test(SPECIAL, command)) {
        return `'${command.replace(SPECIAL_GLOBAL, (flag) => FLAG_REPLACE[flag])}'`;
      } else if (!R.test(TEXT, command)) {
        return `'${command}'`;
      }

      return command;
    }, payload.command);

    commands.push(`  ${command.join(' ')} \\`);
  }

  commands.push('');

  if (payload.artifacts) {
    commands.push('# Extract Artifacts');
    commands.push(...R.map(([name, { type, path }]) => stripIndent`
        mkdir -p '${type === 'file' ? path.dirname(name) : name}'
        docker cp "\${container_name}:${path}" '${name}'
        
      `, R.toPairs(payload.artifacts)));
  }

  commands.push(...['', stripIndent`
    # Delete docker container
    docker rm -v "\${container_name}"
  `]);

  return commands.join('\n');
};