import React from 'react';
import { LinkContainer } from 'react-router-bootstrap';
import {
  NavItem as _NavItem,
  Button as _Button,
  MenuItem as _MenuItem,
  ListGroupItem as _ListGroupItem
} from 'react-bootstrap';

const container = (Element) => (props) => {
  if (!props.href || props.href.startsWith('http')) {
    return <Element {...props}>{props.children}</Element>;
  }
  
  return (
    <LinkContainer to={props.href}>
      <Element {...props}>{props.children}</Element>
    </LinkContainer>
  );
};

export const NavItem = container(_NavItem);
export const Button = container(_Button);
export const MenuItem = container(_MenuItem);
export const ListGroupItem = container(_ListGroupItem);
