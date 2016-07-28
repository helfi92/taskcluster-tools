import R from 'ramda';
import React from 'react';
import { NavDropdown } from 'react-bootstrap';
import { MenuItem } from '../Bootstrap';
import Icon from '../Icon';

export default ({ model }) => {
  const menuItems = model
    .map((group, gi) => group.map((page, i) => (
      <MenuItem key={`group-${gi}-menu-${i}`} href={page.path}>
        <Icon fixedWidth={true} name={page.icon || 'wrench'} />&nbsp;&nbsp;{page.title}
      </MenuItem>
    )))
    .reduce((vdom, group, i) => R.equals(0, i) ? group : [
      ...vdom,
      <MenuItem divider={true} key={`divider-${i}`} />,
      ...group
    ], []);

  return <NavDropdown key="nav1" title="Tools" id="tools">{menuItems}</NavDropdown>;
};
