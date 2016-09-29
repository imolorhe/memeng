/*
 * Copyright (c) 2016. samuelimolo4real@gmail.com
 */

var MemeNGRouter = function (opts) {
	this.logger = new MemeNGLogger();

	// Default options
	var defaults = {
		root: '', // the root of the route
		useHash: false, // should the location hash be used instead of the HTML5 history
		mode: MemeNGRouter.MODES.PUSH_STATE, // set the current mode
	};

	this.opts = Object.assign({}, defaults, opts);

	// Set the current mode based on the user-provided option, and the availability of pushState in history
	this.opts.mode = this.opts.useHash || !history.pushState ? MemeNGRouter.MODES.HASH : MemeNGRouter.MODES.PUSH_STATE;


	this.routes = {}; // Contains the routes specified in the application
};

MemeNGRouter.prototype.route = function (path, cb) {

	this.routes[path] = {cb: cb};
};

MemeNGRouter.prototype.init = function () {

	// Load the current route on initialisation
	this.loadCurrentRoute();

	// Bind the events to load the route when it changes
	this.bindLoadEvents();
};

MemeNGRouter.prototype.bindLoadEvents = function () {
	var eventName = this.opts.mode == MemeNGRouter.MODES.HASH ? 'hashchange' : 'popstate';

	window.addEventListener(eventName, this.loadCurrentRoute.bind(this));
};

MemeNGRouter.prototype.loadCurrentRoute = function () {
	this.logger.log(this.opts);
	var locationKey = this.opts.mode == MemeNGRouter.MODES.HASH ? 'hash' : 'pathname';

	var url = window.location[locationKey].slice(1) || '/';

	var curRoute = null; //Holds the current route when found
	var curParams = []; //Holds the parameters for the current route

	// Loop through the routes to find a matching path
	for(var route in this.routes){
		if(this.routes.hasOwnProperty(route)){
			// If a match is found, break from the loop
			// The routes can have parameters, which start with a colon
			// Basically, match : and every character after it except / and whitespace
			// Then replace the matched parameters with ([\\w-]+) capture group so you can extract the parameters
			// The double backward slash in front of the w is so that the replace function renders the backward slash
			// If there are parameters, extract them
			var routeMatcher = new RegExp(('^' + route + '$').replace(/:[^\s/]+/g, '([\\w-_]+)'));
			var match = url.match(routeMatcher);
			if(match){
				curRoute = this.routes[route];

				// Remove the first index in the array, since that just contains the original url
				curParams = match.shift() && match;
				break;
			}
		}
	}

	if(curRoute){
		this.logger.log('Route found!');
		curRoute.cb.apply(curRoute, curParams);
	}
	else{
		this.logger.log('No route found. :(');
	}

	this.logger.log(url, window.location);
	this.logger.log('Current routes:', this.routes);
};

MemeNGRouter.prototype.goto = function (path) {
	if(!this.opts.useHash){
		this.logger.log('Pushing history state...');
		window.history.pushState(null, null, MemeNGRouter.stripSlashes(path));
		this.loadCurrentRoute();
	}
};

// Enum for the URL change functionality modes
MemeNGRouter.MODES = {
	HASH: 'hash',
	PUSH_STATE: 'push-state'
};

MemeNGRouter.stripSlashes = function (path) {
	return path.replace(/^\//, '').replace(/\/$/, '');
}


	// Test URL => /d/x12/1y3/z?e=1#c/b/a/v
