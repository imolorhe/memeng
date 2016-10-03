/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

let config = {
	projectId: process.env.FIREBASE_PROJECT_ID,
	apiKey: process.env.FIREBASE_API_KEY,
	authDomain: process.env.FIREBASE_AUTH_DOMAIN,
	databaseURL: process.env.FIREBASE_DATABASE_URL,
	storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
	messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
	keyJsonFilePath: process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH,
	keyJsonContent: process.env.FIREBASE_SERVICE_ACCOUNT_JSON_CONTENT && JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_CONTENT) || require(process.env.FIREBASE_SERVICE_ACCOUNT_JSON_PATH)
};

module.exports = config;
