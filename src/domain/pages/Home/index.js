import R from 'ramda';
import React from 'react';
import { view } from 'redux-elm';
import { Col, Row } from 'react-bootstrap';
import { Link } from 'react-router';
import Icon from '../../ui/Icon';
import Markdown from '../../ui/Markdown';

import './home.scss';
import heroUrl from './taskcluster-180.png';

export const title = 'TaskCluster Tools';
export const icon = 'favicon';

export default view(({ model }) => (
  <div id="home">
    <Row>
      <Col md={8} mdOffset={2} sm={10} smOffset={1}>
        <div className="home-header">
          <img src={heroUrl} />
          <h2>
            <span className="light-font">Welcome to</span> <span className="home-logo">TaskCluster Tools</span>
          </h2>
        </div>
      </Col>
    </Row>

    <Row className="home-description">
      <Col sm={12}>
        <p>
          A collection of tools for TaskCluster components and elements in the TaskCluster ecosystem. Here you'll find
          tools to manage TaskCluster as well as run, debug, inspect and view tasks, task-graphs, and other
          TaskCluster related entities.
        </p>
      </Col>
    </Row>

    <Row>
      {R.flatten(model.menu)
        .map((menuItem, index) => (
          <Col md={4} sm={6} key={index}>
            <Link to={menuItem.path} className="home-entry">
              <h4>{menuItem.title}</h4>
              <Icon name={menuItem.icon || 'wrench'} size="3x" className="pull-left" />
              <Markdown>{menuItem.description}</Markdown>
            </Link>
          </Col>
        ))}
    </Row>
  </div>
));
