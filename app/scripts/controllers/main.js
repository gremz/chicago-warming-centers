'use strict';

angular.module('mapApp')
.controller('MainCtrl', function ($scope) {
  $scope.awesomeThings = [
  'HTML5 Boilerplate',
  'AngularJS',
  'Karma'
  ];
  $scope.data = { message: 'FLAG!'};
});

angular.module('mapApp')
.controller('GetData', function($scope, $http) {
  //data references
  var dataUrls = ['http://data.cityofchicago.org/resource/h243-v2q5.json?$jsonp=JSON_CALLBACK', 'warm_data.json'],
      $alert = $('.alert');

  fetchMapData(dataUrls[0], 0);

  // fetchMapData
  function fetchMapData(dataUrl, resourceIndex) {
    var requestType = (dataUrl.indexOf('jsonp') > -1) && 'jsonp' || 'get';

    $http[requestType](dataUrl).
      // on success return data and status
      success(function(data, status, headers, config) {
        window.head = resourceIndex;
        $scope.data.status = !resourceIndex && 'Data OK!' || ('Data backup #' + resourceIndex + ' used'); // if index >0 return error msg
        $scope.data.rawData = data;

        addDataPoints(data);

        flashAlert($alert);
      }).
      // If failed go to next resource or fail with message
      error(function(data, status, headers, config) {
        var nextResource = dataUrls[resourceIndex+1];

        $scope.data.status = 'Failed to fetch data! Attempting backup...';
        nextResource && fetchMapData(nextResource, resourceIndex+1);
        // If hidden show
        $alert.css('display') == 'none' && flashAlert($alert);
      });
    }

    function flashAlert($el) {
      var alertTopHeight = $(window).height()-38;
      $el.css({'position': 'absolute', 'top': alertTopHeight}).show().fadeOut(2500);
    }

    function addDataPoints(rawData) {
      var location,
          marker;
      for (var i=0; i < rawData.length; i++) {
        location = rawData[i].location;
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(location.latitude, location.longitude),
          map: wcm.map,
          title: rawData[i].site_name
        });
        console.log(rawData[i].site_name);

        // "this" is the current marker
        google.maps.event.addListener(marker, 'click', function() {
          wcm.map.setZoom(13);
          wcm.map.setCenter(this.getPosition());
          // Add filter
          var $input = $('.search').first();
          $input.val(this.title);
          $input.trigger('input');
        });
      }
    }

    // loadMap
    (function loadMap(rawData) {
      if (document && document.getElementById('map-canvas')) {
        var mapOptions = {
          center: new google.maps.LatLng(41.847, -87.702),
          zoomControl: true,
          disableDefaultUI: true,
          zoom: 11,
          mapTypeId: google.maps.MapTypeId.ROADMAP
        },
        map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);
        (window.wcm || (window.wcm = {})).map = map;
        console.log('map loaded');

        // Add map events

      } else {
        setTimeout(function() {
          loadMap();
        },250);
      }
    })();

    // Toggle location description
    $scope.showInfo = function($event) {
      $event.preventDefault();
      var $title = $($event.currentTarget);
      $title.siblings().toggle();
      $title.find('.caret').first().toggle();
      $title.find('.open-caret').toggle();
    };

  });
