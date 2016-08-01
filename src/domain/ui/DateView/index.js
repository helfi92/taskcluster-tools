import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';

export default ({ id, date, since, placement = 'top', format = 'Do of MMMM YYYY, H:mm:ss' }) => {
  const later = since ? `(${moment(date).from(since, true)} later)` : '';
  const tooltip = (
    <Tooltip id={id}>
      {moment(date).format(format)}
    </Tooltip>
  );

  return (
    <OverlayTrigger placement={placement} overlay={tooltip}>
      <span id={id}>
        {moment(date).fromNow()} {later}
      </span>
    </OverlayTrigger>
  );
};
