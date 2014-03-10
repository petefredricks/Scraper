
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

var app = express();

var phantom = require( 'node-phantom-simple' );
var async = require( 'async' );
var colors = require( 'colors' );

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

	phantom.create(function( err, ph ) {

		ph.createPage( function( err, page ) {

			setInterval( function() {

				page.open( 'http://localhost:8080/app/login', function( err, status ) {

					if ( status == 'success' ) {
						page.includeJs( '//ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js' , function( err ) {

							// jQuery Loaded
							page.evaluate( function() {
								return $( '#ticket-6904' ).hasClass( 'ticket--offsale' );
							}, function( err,result ) {
								if ( !result ) {
									console.log( 'BUY THE FUCKING TICKETS!!!'.red );
								}
							});
						});
					}
				});
			}, 3000 );
		});
	});
}

checkPage();



http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
