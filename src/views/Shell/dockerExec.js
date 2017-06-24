const EventEmitter = require('wolfy87-eventemitter');
const querystring = require('querystring');
const through2 = require('through2').obj;
const Promise = require('promise');

const MESSAGE_CODES = {
  // stream related message types (carries a payload)
  STDIN: 0,
  STDOUT: 1,
  STDERR: 2,
  //special message type (carries a payload)
  RESIZE: 50,
  // data-flow related message types (carries no payload)
  RESUME: 100, // Process is now ready to receive data
  PAUSE: 101, // Process is processing current data, don't send more right now
  END: 102, //Indicates end of stream
  // resolution related message types
  STOPPED: 200, // Process exited, payload is single byte exit code
  SHUTDOWN: 201, // Server shut down
  ERROR: 202 // Some internal error occurred, expect undefined behaviour
  //may carry utf8 payload regarding error reason
};

export default class DockerExec extends EventEmitter {
  constructor(options) {
    super();
    this.options = Object.assign({}, {
      tty: true,
      command: 'sh',
    }, options);
  }

  /* Makes a client program with unbroken stdin, stdout, stderr streams
   * Is also an EventEmitter with 'exit' event
   *
   * Required options:
   * url parts (hostname port pathname)
   * or url
   * tty: whether or not we expect VT100 style output
   * command: array or string of command to be run in exec
   */
  async execute() {
    this.url = this.options.url + '?' + querystring.stringify({
        tty: this.options.tty ? 'true' : 'false',
        command: this.options.command,
      });

    if (!/ws?s:\/\//.test(this.url)) {
      throw(new Error('URL required or malformed'));
    }

    this.socket = new WebSocket(this.url);
    this.socket.binaryType = 'arraybuffer';
    this.socket.addEventListener('open', () => {
      this.emitEvent('open');
    });

    this.stdin = through2((data, enc, cb) => {
      this.sendMessage(MESSAGE_CODES.STDIN, data);
      cb();
    }, cb => {
      this.sendCode(MESSAGE_CODES.END);
      cb();
    });

    const MAX_OUTSTANDING_BYTES = 8 * 1024 * 1024;
    this.outstandingBytes = 0;

    //stream with pause buffering, everything passes thru here first
    this.strbuf = through2();
    this.strbuf.on('data', data => {
      this.outstandingBytes += data.length;
      this.socket.send(data);
      this.outstandingBytes -= data.length;

      if (this.outstandingBytes > MAX_OUTSTANDING_BYTES) {
        this.strbuf.pause();
        this.emitEvent('paused');
      } else {
        this.strbuf.resume();
        this.emitEvent('resumed');
      }
    });
    //Starts out paused so that input isn't sent until server is ready
    this.strbuf.pause();

    this.stdout = through2();
    this.stderr = through2();
    this.stdout.draining = false;
    this.stderr.draining = false;

    this.stdout.on('drain', () => {
      this.stdout.draining = false;
      if (!this.stderr.draining) {
        this.sendCode(MESSAGE_CODES.RESUME);
      }
    });

    this.stderr.on('drain', () => {
      this.stderr.draining = false;
      if (!this.stdout.draining) {
        this.sendCode(MESSAGE_CODES.RESUME);
      }
    });

    this.socket.onmessage = messageEvent => {
      this.messageHandler(messageEvent);
    };

    await new Promise((accept, reject) => {
      this.socket.addEventListener('error', reject);
      this.socket.addEventListener('open', accept);
    });
    this.socket.addEventListener('error', err => this.emitEvent('error', err));
  }

  messageHandler(messageEvent) {
    let message = new Uint8Array(messageEvent.data);
    // the first byte is the message code
    switch (message[0]) {
      //pauses the client, causing strbuf to buffer
      case MESSAGE_CODES.PAUSE:
        this.strbuf.pause();
        this.emitEvent('paused');
        break;

      //resumes the client, flushing strbuf
      case MESSAGE_CODES.RESUME:
        this.strbuf.resume();
        this.emitEvent('resumed');
        break;

      case MESSAGE_CODES.STDOUT:
        if (!this.stdout.write(message.slice(1))) {
          this.sendCode(MESSAGE_CODES.PAUSE);
          this.stdout.draining = true;
        }
        break;

      case MESSAGE_CODES.STDERR:
        if (!this.stderr.write(message.slice(1))) {
          this.sendCode(MESSAGE_CODES.PAUSE);
          this.stderr.draining = true;
        }
        break;

      //first byte contains exit code
      case MESSAGE_CODES.STOPPED:
        this.emitEvent('exit', message.readInt8(1));
        this.close();
        break;

      case MESSAGE_CODES.SHUTDOWN:
        this.emitEvent('shutdown');
        this.close();
        break;

      case MESSAGE_CODES.ERROR:
        this.emitEvent('error', message.slice(1));
        break;

      default:
        break;
    }
  }

  resize(h, w) {
    if (!this.options.tty) {
      throw new Error('cannot resize, not a tty instance');
    }

    const buffer = new Uint8Array(4);

    this.sendCode(MESSAGE_CODES.RESUME);
    buffer.set(new Uint16Array([h]), 0);
    buffer.set(new Uint16Array([w]), 2);
    this.sendMessage(MESSAGE_CODES.RESIZE, buffer);
  }

  sendCode(code) {
    this.strbuf.write(new Uint8Array([code]));
  }

  sendMessage(code, data) {
    code = new Uint8Array([code]);
    data = data instanceof Uint8Array ? data : new Uint8Array([data.charCodeAt(0)]);
    const message = new Uint8Array(data.length + code.length);

    message.set(code);
    message.set(data, code.length);

    this.strbuf.write(message);
  }

  close() {
    if (!this.strbuf.paused) {
      this.socket.close();
      this.stdin.end();
      this.stdout.end();
      this.stderr.end();
      this.strbuf.end();
    } else {
      this.strbuf.on('drain', () => {
        this.socket.close();
        this.stdin.end();
        this.stdout.end();
        this.stderr.end();
        this.strbuf.end();
      });
    }
  }
};
