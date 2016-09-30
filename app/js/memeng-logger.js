/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */


var MemeNGLogger = function (opts) {
	var defaults = {
		logLevel: MemeNGLogger.LOG_LEVELS.ALL
	};

	this.opts = Object.assign({}, defaults, opts);

	// TODO Figure out a better way probably in the prototype
	this.log = (this.opts.logLevel >= MemeNGLogger.LOG_LEVELS.ALL) ? console.log.bind(console, '::') : function () { console.log('Log disabled.')};
};

MemeNGLogger.LOG_LEVELS = {
	ALL: 0,
	INFO: 1,
	DEBUG: 2,
	ERROR: 3
};

// TODO Complete the log function
MemeNGLogger.prototype.log = function (message) {
	var stackObj = MemeNGLogger.getErrorObject();
	var stackArray = stackObj.stack.split(/\n\s*/);
	// console.log(stackArray);
	for(var i = 0, len = stackArray.length; i < len; i++){
		match = stackArray[i].match(/\((.*)\)/);
		match && console.log(match[1]);
	}
	console.log(message);
};



MemeNGLogger.prototype.error = function (message) {
	console.error(message);
};

MemeNGLogger.getErrorObject = function () {
	try {
		throw Error('')
	}
	catch(err) {
		return err;
	}
};

module.exports = MemeNGLogger;
