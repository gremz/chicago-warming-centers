'use strict';

/* mapData
    get(): make call to get requested json data
    addDataPoints(): add google maps data points from json data
*/
angular.module('mapApp')
  .factory('mapData', function($http, $q, map) {
    var dataUrls = ['http://data.cityofchicago.org/resource/h243-v2q5.json?$jsonp=JSON_CALLBACK', 'warm_data.json'],
      resourceIndex = 0,
      deffered = $q.defer(),
      mapData;

    function handleSuccess(response) {
      if (response.data) {
        map.addPoints(response.data);
        deffered.resolve(response.data);
      } else {
        mapData.get();
      }
    }

    function handleError(response) {
      if (response.status === 444) {
        return;
      } else {
        mapData.get();
      }
    }

    return mapData = {
      get: function get() {
        var dataUrl = dataUrls[resourceIndex],
          requestType = ((dataUrl.indexOf('jsonp') > -1) && 'jsonp') || 'get';

        $http[requestType](dataUrls[resourceIndex++])
          .then(handleSuccess, handleError);

        return deffered.promise;
      }
    };
  })
  /* map
      addPoints(): add markers to google map
      load(): load google map 
  */
  .factory('map', function() {
    return {
      // addpoints
      addPoints: function addPoints(rawData) {
        var location,
          marker,
          i;

        function markerClickEvent() {
          wcm.map.setZoom(13);
          wcm.map.setCenter(this.getPosition());
          // Add filter
          var $input = $('.search').first();
          $input.val(this.title);
          $input.trigger('input');
          $('.description[data-uid="' + this.uId + '"').show();
        }
        for (i = 0; i < rawData.length; i++) {
          location = rawData[i].location;
          marker = new google.maps.Marker({
            position: new google.maps.LatLng(location.latitude, location.longitude),
            map: wcm.map,
            title: rawData[i].site_name,
            uId: rawData[i].location.longitude.split('.')[1]
          });

          // "this" is the current marker
          google.maps.event.addListener(marker, 'click', markerClickEvent);
        }
      },
      // load
      load: function load() {
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
        } else {
          setTimeout(function() {
            load();
          }, 250);
        }
      }
    };
  })
  /* alert
      flash(): show -> fade notification bar
  */
  .factory('alert', function() {
    return {
      flash: function($el, message) {
        var alertTopHeight = $(window).height() - 38;
        $el.css({'position': 'absolute', 'top': alertTopHeight}).show().fadeOut(2500);
      }
    };
  });

angular.module('mapApp')
  .controller('MainCtrl', function ($scope, $cookies) {
    if (!$cookies.firstTimer) {
      $cookies.firstTimer = '1';
      $('#infoModal').modal('show');
    }
  })
  .controller('GetData', function($scope, map, mapData) {
    //DOM references
    var $alert = $('.alert');

    // Define data namespace
    !$scope.data && ($scope.data = {});

    // loadMap
    map.load();

    $scope.data.rawData = mapData.get({});

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

  });