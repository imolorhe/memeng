/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

/**
 * @return {boolean}
 */
var MemeNG = function (firebase, config) {
	this.logger = new MemeNGLogger();

	if(!firebase){
		this.logger.error('Firebase app is not available.');
		return false;
	}
	firebase.initializeApp(config);
	this.logger.log('%cMemeNG initialised.', 'color: green;');
	this.firebase = firebase;
	this.database = firebase.database();
	this.auth = firebase.auth();
};

MemeNG.prototype.getMemes = function () {
	return this.database.ref('/memes').once('value');
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

	// If the meme doesn't exist, don't continue
	if(!this.memeExists(id))return false;

	var memeBaseURL = '';
	var memeImageName = id;
	var url = 'https://memegen.link/custom/<top>/<bottom>.jpg?alt=<memeBaseURL>/<memeImageName>.jpg';

	// var url = 'https://memegen.link/api/templates/' + id + '/' + MemeNG.encodeMemeText(topText) + '/' + MemeNG.encodeMemeText(bottomText) + '';
	return url
		.replace('<top>', MemeNG.encodeMemeText(topText))
		.replace('<bottom>', MemeNG.encodeMemeText(bottomText))
		.replace('<memeBaseURL>', encodeURIComponent())
		.replace('<memeImageName>', encodeURIComponent());
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

