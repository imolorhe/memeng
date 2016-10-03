/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

'use strict';

// Load the variables in .env to process.env
require('dotenv').config({silent: true});

process.env['PROJECT_ROOT'] = __dirname;
process.env['FIREBASE_SERVICE_ACCOUNT_JSON_PATH'] = __dirname + process.env.FIREBASE_SERVICE_ACCOUNT_JSON_RELATIVE_PATH;
// process.env['FIREBASE_SERVICE_ACCOUNT_JSON_CONTENT'] = require(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH);

// console.log(require(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH).type);
// Start the app
require('./app/app');
