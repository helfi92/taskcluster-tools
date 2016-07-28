import React from 'react';
import { NavDropdown, Glyphicon } from 'react-bootstrap';
import { NavItem, MenuItem } from '../Bootstrap';
import Icon from '../Icon'

export default ({ model, dispatch }) => {
  const signIn = () => dispatch({ type: 'SIGN_IN' });
  const signOut = () => dispatch({ type: 'SIGN_OUT' });

  if (!model.credentials) {
    return (
      <NavItem onSelect={signIn}>
        <Glyphicon glyph="log-in" /> Sign in
      </NavItem>
    );
  }

  // TODO: color this according to time until expiry
  const glyph = model.credentialsExpiringSoon ? 'exclamation-sign' : 'user';
  const className = model.credentialsExpiringSoon ? 'text-warning' : '';

  const menuHeading = (
    <span>
        <Glyphicon className={className} glyph={glyph} /> {model.credentials.clientId}
      </span>
  );

  return (
    <NavDropdown key="credentials-dropdown" id="credentials" title={menuHeading}>
      <MenuItem href="/credentials">
        <Icon name="key" /> Manage Credentials
      </MenuItem>
      <MenuItem divider />
      <NavItem onSelect={signIn}>
        <Glyphicon glyph="log-in" /> Sign In
      </NavItem>
      <NavItem onSelect={signOut}>
        <Glyphicon glyph="log-out" /> Sign Out
      </NavItem>
    </NavDropdown>
  );
};
