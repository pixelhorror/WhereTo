var WhereToApp = function() {
	var self = this;

	//Fallback coordinates if we don't have access to geolocation
	self.defaultCoords = {
		name: 'Bogotá',
		lat: 4.6611903,
		lon: -74.0806762
	};

	self.currentCoords = {};


	self.map;
	self.markers		=	[];
	self.clientID 		=	'YKZQCTDA53AR5BIHHOPWQZ0CFMSXNH4P3BXJSWZPQI0BT0I4';
	self.clientSecret 	=	'FP24DBOW5M0SZ5ABJR11NL4YOQCWTDK4NAUR3VSGEHMNCXKO';
	self.radius			=	'200';
	self.apiVersion		=	'20130710';
	self.spinnerTarget	=	$('#spin')[0];

	self.opts			=	{
		lines: 13, // The number of lines to draw
		length: 20, // The length of each line
		width: 10, // The line thickness
		radius: 30, // The radius of the inner circle
		corners: 1, // Corner roundness (0..1)
		rotate: 0, // The rotation offset
		direction: 1, // 1: clockwise, -1: counterclockwise
		color: '#000', // #rgb or #rrggbb
		speed: 1, // Rounds per second
		trail: 60, // Afterglow percentage
		shadow: false, // Whether to render a shadow
		hwaccel: true, // Whether to use hardware acceleration
		className: 'spinner', // The CSS class to assign to the spinner
		zIndex: 2e9, // The z-index (defaults to 2000000000)
		top: 'auto', // Top position relative to parent in px
		left: 'auto' // Left position relative to parent in px
	};


	self.build = function() {
		self.spinner = new Spinner( self.opts );

		if ( self.isGeolocationAvailable() ) {
			self.spinner.spin( self.spinnerTarget );

			navigator.geolocation.getCurrentPosition( function( position ) {
     			self.currentCoords['lat'] = position.coords.latitude;
     			self.currentCoords['lon'] = position.coords.longitude;

				self.map = L.map('map').setView([ self.currentCoords['lat'], self.currentCoords['lon'] ], 15);
				L.tileLayer('http://{s}.tile.cloudmade.com/d7b35edc34c14fd19114e2212c4b5235/999/256/{z}/{x}/{y}.png', {
			   		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery Â© <a href="http://cloudmade.com">CloudMade</a>'
				}).addTo( self.map );

				L.marker([ self.currentCoords['lat'], self.currentCoords['lon'] ]).addTo( self.map )
				    .bindPopup('Here we are :)')
				    .openPopup();
			});		
		} else {
			self.currentCoords = self.defaultCoords;
		}

     	self.spinner.stop();     			
	}

	self.getDefaultCoords = function () {
		return this.defaultCoords;
	}

	self.isGeolocationAvailable = function() {
		return 'geolocation' in navigator;
	}

	self.setCurrentPosition = function() {
		if ( self.isGeolocationAvailable() ) {
			navigator.geolocation.getCurrentPosition( function( position ) {
     			self.currentCoords['lat'] = position.coords.latitude;
     			self.currentCoords['lon'] = position.coords.longitude;     			
			});		
		} else {
			self.currentCoords = self.defaultCoords;
		}
	}

	self.getCurrentPosition = function() {
		return self.currentCoords;
	}

	self.getTrending = function() {
		self.request( self.buildURL( 'trending' ) );
	}

	self.getPopular = function() {
		self.request( self.buildURL( 'explore' ) );
	}

	self.updateMarkers = function( data ) {

		
		data.forEach( function( ele, i ) {
			var Marker = L.marker([ ele.venue.location.lat, ele.venue.location.lng ])
							.bindPopup( ele.venue.name )
					    	.openPopup();
			
			self.markers.push( Marker );
			self.map.addLayer( self.markers[i] );
		})
	}

	self.clearMarkers = function(){
		self.markers.forEach( function( ele, i ) {
			self.map.removeLayer( self.markers[i] );
		});
	}

	self.print = function( data ) {
		var source,
			template,
			html;

		source		=	$('#list-template').html();
		template	=	Handlebars.compile(source);
		html		=	template( data );

		$('#list').html( html );
	}

	self.buildURL = function( type ) {
		return 'https://api.foursquare.com/v2/venues/'+ type +'?ll='+ self.currentCoords['lat'] +','+ self.currentCoords['lon'] +'&client_id='+ self.clientID +'&client_secret='+ self.clientSecret +'&radius='+ self.radius +'&v=20130710';
	}

	self.request = function( url ) {
		self.spinner.spin( self.spinnerTarget );

		$.ajax({
			type: 'GET',
			url: url,
			success: function( obj ){
				console.log( obj );
				self.print(obj.response);
				self.updateMarkers(obj.response.groups[0].items);
     			self.spinner.stop();     									
			},
			error: function( obj ){
				console.log( obj );
     			self.spinner.stop();     									
			}

		});
	}

}

var app = new WhereToApp();

app.build();

$('#popular').click( app.getPopular );
$('#trending').click( app.getTrending );
$('#clear').click( app.clearMarkers );