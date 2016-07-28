import React from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router';
import { Navbar, Nav, NavbarBrand } from 'react-bootstrap';
import Menu from './Menu';
import CredentialsMenu from './CredentialsMenu';
import CredentialsOverlay from './CredentialsOverlay';
import Icon from '../Icon';
import './navigation.scss';
import navIconUrl from './taskcluster-36.png';

const { Header, Text } = Navbar;

export default ({ model, dispatch }) => {
  const { currentPage } = model;
  let nav = null;

  return (
    <div id="navbar">
      <Navbar fluid={true} inverse={true} staticTop={true}>
        <Header>
          <NavbarBrand>
            <Link to="/">
              <img src={navIconUrl} width="36" height="36" /> <span>TaskCluster Tools</span>
            </Link>
          </NavbarBrand>
        </Header>

        <Text hidden={!currentPage.path}>
          <span>
            <Icon fixedWidth={true} name={currentPage.icon || 'wrench'} />&nbsp;&nbsp;{currentPage.title}
          </span>
        </Text>

        <Nav pullRight={true} ref={(ref) => nav = ref}>
          <Menu model={model.menu} />
          <CredentialsMenu model={model} dispatch={dispatch} />
        </Nav>

        <CredentialsOverlay model={model} dispatch={dispatch} target={() => findDOMNode(nav)} />
      </Navbar>
    </div>
  );
};
