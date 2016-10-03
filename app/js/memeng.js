/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

'use strict';

let path = require('path');
let https = require('https');
let fs = require('fs');
let crypto = require('crypto');
let sh = require('shorthash');

let firebase = require('./firebase');
let GCloud = require('gcloud');

let MemeNGLogger = require('./memeng-logger');

/**
 *
 * @param config
 * @returns {*}
 * @constructor
 */
var MemeNG = function (config) {
	this.logger = new MemeNGLogger();

	if(!firebase){
		this.logger.error('Firebase app is not available.');
		return false;
	}

	// Check if firebase has been initialised, else initialise it.
	try{
		firebase.app();
	}
	catch(e){
		firebase.initializeApp(config);
	}

	// this.logger.log('%cMemeNG initialised.', 'color: green;');
	this.firebase = firebase;
	this.database = firebase.database();
	this.auth = firebase.auth();
	if(firebase.storage){
		this.storage = firebase.storage();
	}
	else{
		var gcloud = GCloud({
			projectId: config.projectId,
			// keyFilename: config.keyJsonFilePath
			credentials: config.keyJsonContent
		});

		var gcs = gcloud.storage();

		// Save a reference to the bucket object
		this.bucket = gcs.bucket(config.storageBucket);
		this.bucket.exists(function (err, exists) {
			// console.log(err, exists);
			if(err){
				console.log('Something went wrong.', err.message);
			}
		});
	}

	// console.log('Storage bucket: ');
	// console.log(this.storage);

	return this;
};

MemeNG.prototype.getMemes = function () {
	return this.database.ref('/memes').once('value');
};

MemeNG.prototype.getMemeDetails = function (id) {
	return this.database.ref('/memes/' + id).once('value').then(function (snapshot) {
		return snapshot.val();
	});
};

/**
 * returns the URL of the generated meme
 * @param opts.id
 * @param opts.top
 * @param opts.bottom
 *
 */
MemeNG.prototype.createMeme = function (opts) {
	var id = opts.id;
	var topText = opts.top;
	var bottomText = opts.bottom;

	var that = this;

	return new Promise(function(resolve, reject){
		// If the meme doesn't exist, don't continue
		// if(!this.memeExists(id))return false;
		that.getMemeDetails(id).then(function(data) {
			// console.log(data);

			if(!data){
				console.log('Meme not found.');
				reject(Error('Meme not found.'));
				return false;
			}
			var memeBaseURL = '';
			var memeImageName = data.imageName;
			// console.log('ref', that.storage.storage);
			var memeImageRef = that.bucket.file('memes/' + memeImageName);
			memeImageRef.exists(function(err, exists){
				if(err){
					console.log(err.message);
					reject(err);
					return false;
				}
				if(!exists){
					console.log('File does not exist');
					reject(Error('File does not exist.'));
					return false;
				}

				// Get a valid URL for the image
				memeImageRef.getSignedUrl({
					action: 'read',
					// Make the link available for one day (24 hours * 60 minutes * 60 seconds)
					expires: +(new Date()) + (60 * 60 * 24)
				}, function(err, imageURL){
					if(err){
						console.log(err.message);
						reject(err);
						return false;
					}

					var url = 'https://memegen.link/custom/<top>/<bottom>.jpg?alt=' + encodeURIComponent(imageURL);

					// var url = 'https://memegen.link/api/templates/' + id + '/' + MemeNG.encodeMemeText(topText) + '/' + MemeNG.encodeMemeText(bottomText) + '';
					url = url
						.replace('<top>', MemeNG.encodeMemeText(topText))
						.replace('<bottom>', MemeNG.encodeMemeText(bottomText));

					var result = {
						url: url,
						opts: opts
					};
					resolve(result);
				});
			});
		});
	});

};

/**
 * checks if the meme identified by the provided id exists
 * @param id
 * @returns {boolean}
 */
MemeNG.prototype.memeExists = function (id) {
	// TODO Check the database if the specified meme exists
	// TODO Return true if the specified meme exists, else return false
	return true;
};

MemeNG.prototype.authenticate = function (email, password) {
	var that = this;
	this.auth.signInWithEmailAndPassword(email, password).catch(function (error) {
		that.logger.log(error.message);
	});
};

/**
 * encodes the text using the prescribed format from memegen.link
 * @param text
 * @returns {XML|string}
 */
MemeNG.encodeMemeText = function (text) {
	return text
		.toLowerCase()
		.replace(/-/g, '--')
		.replace(/_/g, '__')
		.replace(/\s/g, '-')
		.replace(/\?/g, '~q')
		.replace(/%/g, '~p')
		.replace(/#/g, '~h')
		.replace(/\//g, '~s')
		.replace(/"/g, "''");
};

MemeNG.downloadFile = function (url) {

	// let memeHash = crypto.createHash('md5').update(url).digest("hex");
	let memeHash = sh.unique(url);
	let tmpFileURL = process.env.PROJECT_ROOT + '/tmp/' + memeHash + '.jpg';
	// console.log(memeHash);
	// TODO: Check if file has already been created instead of creating multiple files.
	let file = fs.createWriteStream(tmpFileURL);
	return new Promise(function(resolve, reject){
		let request = https.get(url, function(response) {
			response.pipe(file).on('close', function(){
				// res.sendFile(tmpFileURL);
				resolve({fileURL: tmpFileURL});
			});
		});
	});

};


//---------
/*
	Meme model
	memes
		id e.g. packing-chairs
		name e.g. Packing Chairs
		description e.g. People packing chairs
		aliases
			chairs
			packing

*/

module.exports = MemeNG;
