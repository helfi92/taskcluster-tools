import React from 'react';
import { Form } from 'react-bootstrap';
import formData from 'react-formdata';

const WrappedForm = formData((props) => {
  return <Form {...props} />;
});

export default (props) => {
  let ref;
  const submit = (e) => {
    if (props.onSubmit) {
      e.preventDefault();
      props.onSubmit(e, ref.getValues());
    }
  };

  return <WrappedForm {...props} ref={r => ref = r} onSubmit={submit} />
};
