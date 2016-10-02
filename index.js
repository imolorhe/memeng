/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

'use strict';

// Load the variables in .env to process.env
require('dotenv').config({silent: true});

process.env['PROJECT_ROOT'] = __dirname;

// Start the app
require('./app/app');
