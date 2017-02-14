import React from 'react';
import ReactDOM from 'react-dom';
import { Router, hashHistory } from 'react-router';

import css from '../scss/base.scss';

import routes from './routes/routes'

const MOUNT_POINT = document.getElementById('app')

ReactDOM.render(
  <Router history={hashHistory} routes={routes} />,
  MOUNT_POINT
);
