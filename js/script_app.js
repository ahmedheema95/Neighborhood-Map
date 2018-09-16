var map;
// initially set map state to false
var MapState = false;

// method to show error if map failed to load 
function maperror() {
    alert("Error Loading Map , Check Your Internet Connection And Try Again");
}

// method that show the window which contains information about the place 
function SetWindowContent(location) {
    return ('<div class="infowindow">'+ '<div id="location-name">' + '<h4>' + location.name + '</h4>'+ 
			'</div>' + '<h7>'+location.Description+'</h7>'+'</div>');
    
}

// method to make handler to set markers on the map 
function makeHandler(marker, i) {
    return function() {
        if (!MapState) {
            return;
        }
        infoWindow.setContent(SetWindowContent(locations[i]));
        infoWindow.open(map, marker);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            marker.setAnimation(null);
        }, 1000);
        viewModel.loadData(locations[i]);

    };
}

// List of locations and their position on map and associated information 
var locations = [{
        name: "El-Tahra Palace",
        category: "Palace",
        lat:  30.098287,
        lng:  31.309679,
		Description: "El-Tahra Palace is a palace located in Zeiton, Cairo, Egypt that was designed by Antonio Lasciac.It was mainly built for Princess Amina,daughter of Khedive Ismail and mother of Mohamed Taher Pasha.It was built in Italianate Palazzo style.",
       
    },
    {
        name: "El Saedy Barbecue Restaurant",
        category: "Restaurant",
        lat: 30.103221,
        lng: 31.310818,
		Description: "Barbecue Restaurant located in zeiton where you can find delicious kofta , kabab and also grilled chickens",
       
    },
    {
        name: "El-Tahra Super market",
        category: "Super market",
        lat:  30.098832,
        lng: 31.310786,
		Description: "Super market located in zeiton contains all categories of food",
        
    },
    {
        name: "El-Ganzory Hospital",
        category: "Hospital",
        lat: 30.097121,
        lng: 31.309808,
		Description: "Hospital located in zeiton , Egypt",       
    },
    {
        name: "El-Salam College School",
        category: "School",
        lat:30.095416,
        lng: 31.307999,
		Description: "School Located in zeiton contains differnt education stages including secondary school",
        
    },
    {
        name: "Hussien Fahmy Mosque",
        category: "Mosque",
        lat:30.097852,
        lng: 31.313404,
		Description: "Mosque Located in zeiton",
        
    },
    {
        name: "Braziliano Cafe",
        category: "Cafe",
        lat:30.098267,
        lng: 31.313975,
		Description: "Coffe Shop in zeiton includes hot drinks and also fast food",
        
    },		
];


// method init map initalizes map 
function initMap() {
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap',
        zoom: 14
    }; 
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    setMarkers(locations);
    function setMarkers() {
        // loop to get all locations and their position to mark them on map
        for (i = 0; i < locations.length; i++) {
            var location = locations[i];
            var position = new google.maps.LatLng(location.lat, location.lng);
            bounds.extend(position);
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                animation: google.maps.Animation.DROP,          
                title: location.name,
                id: i
            });
            location.marker = marker;
            map.fitBounds(bounds);
            google.maps.event.addListener(marker, 'click', makeHandler(marker, i));
        }
        infoWindow = new google.maps.InfoWindow();
        var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
            this.setZoom(15);
            google.maps.event.removeListener(boundsListener);
        });
    } 
    MapState = true;
}

// Map Main Controller 
var ViewModel = function() {
    var self = this;
    self.locations = ko.observableArray(locations);
    self.query = ko.observable('');
    self.wikiLinks = ko.observableArray([]);
    self.visibleLists = ko.observable(false);
 
   /*  filtered locations according to the name which user input */
    self.searchResults = ko.computed(function() {
        var q = self.query().toLowerCase();
        var filteredLocations = self.locations().filter(function(location) {
            return location.name.toLowerCase().indexOf(q) >= 0;
        });

        if (MapState) {
			//  set each marker to false before showing filtered locations
            for (var i = 0; i < locations.length; i++) {
                locations[i].marker.setVisible(false);
            }
            for (i = 0; i < filteredLocations.length; i++) {
			//  show the marker of filtered locations	
                filteredLocations[i].marker.setVisible(true);
            }
        }
        return filteredLocations;
    });

    //  using Wikipedia api shows related information about category of each location 
    self.clickLocation = function(location) {
        if (!MapState) {
            return;
        }
        infoWindow.setContent(SetWindowContent(location));
        infoWindow.open(map, location.marker);
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            location.marker.setAnimation(null);
        }, 1000);
        self.loadData(location);
    };

    self.loadData = function(location) {
        
        self.wikiLinks([]);
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + location.category +
            '&format=json&callback=wikiCallback';

        // if the wikipedia links fail to load after 8 seconds the user will get the message 'failed to get wikipedia resources'.
        var wikiRequestTimeout = setTimeout(function() {
            self.wikiLinks.push("failed to get wikipedia resources");
        }, 8000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            success: function(response) {
                self.wikiLinks([]);
                var articleList = response[1];
                for (var i = 0; i < articleList.length; i++) {
                    articleStr = articleList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + articleStr;
                    self.wikiLinks.push('<a href="' + url + '">' + articleStr + '</a>');
                }
                clearTimeout(wikiRequestTimeout);
            }
        });
        return false;
    };
};

var viewModel = new ViewModel();
ko.applyBindings(viewModel);

