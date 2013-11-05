'use strict';

// Singleton factory
angular.module('mapApp').factory('MapData', function($http) {
  var dataUrls = ['http://data.cityofchicago.org/resource/h243-v2q5.json?$jsonp=JSON_CALLBACK', 'warm_data.json'],
      resourceIndex = 0,
      dataUrl = dataUrls[resourceIndex];
  return {
    get: function(callback) {
      var requestType = (dataUrls[resourceIndex].indexOf('jsonp') > -1) && 'jsonp' || 'get';

      return dataUrls[resourceIndex] ? $http[requestType](dataUrls[resourceIndex++]) : { status: 404 };
    }
  }
});

angular.module('mapApp')
.controller('MainCtrl', function ($scope, $cookies) {
  if (!$cookies.firstTimer) {
    $cookies.firstTimer = '1';
    $('#infoModal').modal('show');
  }
});

angular.module('mapApp')
.controller('GetData', function($scope, MapData) {
  //data references
  var $alert = $('.alert');

  // Define data scope
  !$scope.data && ($scope.data = {});

  function handleRequest(response) {
      if (response.data) {
        addDataPoints(response.data);
      } else if (response.status == 404) {
        // handle total failure
      } else {
        MapData.get().then(handleRequest, handleRequest);
      }
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
        title: rawData[i].site_name,
        uId: rawData[i].location.longitude.split('.')[1]
      });

      // "this" is the current marker
      google.maps.event.addListener(marker, 'click', function() {
        wcm.map.setZoom(13);
        wcm.map.setCenter(this.getPosition());
        // Add filter
        var $input = $('.search').first();
        $input.val(this.title);
        $input.trigger('input');
        $('.description[data-uid="' + this.uId + '"').show();
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

  $scope.clearQuery = function() {
    var $searchInput = $('.search-container .search');
    $scope.query = '';
  };

  handleRequest({});

});
