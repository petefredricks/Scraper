
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var cp = require("child_process");

var app = express();

var phantom = require( 'node-phantom-simple' );
var async = require( 'async' );
var colors = require( 'colors' );
//var url = 'http://www.lollapalooza.com/tickets/';
//var url = 'http://localhost:8080/app/login';

// all environments
app.set('port', process.env.PORT || 8888);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

function checkPage() {

	var currentPage = 'home';

	phantom.create(function( err, ph ) {

		ph.createPage( function( err, page ) {

			var int = setInterval( function() {

				var url = currentPage == 'home' ? 'http://www.lollapalooza.com/' : 'http://www.lollapalooza.com/tickets/';

				page.open( url, function( err, status ) {

					var msg;

					if ( status !== 'success' ) {
						msg = 'problem ' + currentPage + '...';
						console.log( new Date() + ': ' + msg.yellow );
					}
					else {
						msg = 'checking ' + currentPage + '...';
						console.log( new Date() + ': ' + msg.green );
						page.includeJs( '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js' , function( err ) {

							// jQuery Loaded
							page.evaluate( function() {

								return $( '*[class$="--onsale"]' ).length !== 0;

							}, function( err, result ) {

								currentPage = currentPage === 'home' ? 'tickets' : 'home';

								if ( result ) {
									clearInterval( int );
									ph.exit();
									cp.exec( 'open /Applications/Google\\ Chrome.app/ "' + url + '"', function() {
										console.log( 'BUY THE FUCKING TICKETS!!!'.red );
									});
								}
							});
						});
					}
				});
			}, 15000 );
		});
	});
}

checkPage();

console.log( 'Scraper started!'.green );
