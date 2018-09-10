'use strict';

app.controller('FinancialController', [
  '$q',
  '$scope',
  '$rootScope',
  '$routeParams',
  '$location',
  'CategoryService',
  function ($q, $scope, $rootScope, $routeParams, $location, CategoryService) {
    $scope.markers = [];
    $scope.categorys = [];
    $scope.selected = undefined;

    var id = $routeParams.id;
    var path = $location.$$url;

    $scope.findAuxiliar = function () {
      $q
        .all([
          CategoryService.mapa(
            'nodes',
            'amenity',
            'atm',
            $scope.center.lat,
            $scope.center.lng,
            $scope.metersPerPx.toFixed(2)
          ),
          CategoryService.mapa(
            'nodes',
            'amenity',
            'bank',
            $scope.center.lat,
            $scope.center.lng,
            $scope.metersPerPx.toFixed(2)
          ),
          CategoryService.mapa(
            'nodes',
            'amenity',
            'bureau_de_change',
            $scope.center.lat,
            $scope.center.lng,
            $scope.metersPerPx.toFixed(2)
          )
        ])
        .then(function (result) {
          $scope.updateMarker(result[0], 'plus', 'red');
          $scope.updateMarker(result[1], 'plus', 'green');
          $scope.updateMarker(result[2], 'plus', 'purple');
        });
    };

    $scope.updateMap = function () {
      $scope.mapas = [];
      $scope.markers = [];
      $scope.findAuxiliar();
    };

    $scope.updateMarker = function (markers, ticon, tcolor) {
      angular.forEach(markers.features, function (poi) {
        $scope.markers.push({
          lat: poi.geometry.coordinates[1],
          lng: poi.geometry.coordinates[0],
          message: poi.properties.popupContent === null ? poi.properties.group : poi.properties.popupContent,
          focus: false,
          draggable: false,
          icon: {
            type: 'awesomeMarker',
            icon: ticon,
            markerColor: tcolor
          }
        });
      });
    };

    if (path === '/financial') {
      angular.extend($scope, {
        events: {
          map: {
            enable: [],
            logic: 'emit'
          },
          marker: {
            enable: ['click'],
            logic: 'emit'
          }
        },
        center: {
          lat: -25.4112421,
          lng: -49.2747793,
          zoom: 14,
          autoDiscover: true
        },
        defaults: {
          scrollWheelZoom: true,
          zoomAnimation: true,
          markerZoomAnimation: true,
          fadeAnimation: true,
          tileLayerOptions: {
            detectRetina: true,
            reuseTiles: true
          }
        },
        controls: {
          scale: true
        },
        markers: $scope.markers,
        legend: {
          position: 'bottomleft',
          colors: ['red', 'green', 'purple'],
          labels: ['atm', 'bank', 'change']
        },
        layers: {
          baselayers: {
            preload: Infinity,
            osm: {
              name: 'OpenStreetMap',
              url: 'https://dev-sterna.estaleiro.serpro.gov.br/geo/api/tiles/OSM/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            otm: {
              name: 'OpenTopoMap',
              url: 'https://dev-sterna.estaleiro.serpro.gov.br/geo/api/tiles/OTM/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            lite: {
              name: 'OpenLiteMap',
              url: 'https://dev-sterna.estaleiro.serpro.gov.br/geo/api/tiles/LITE/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            natgeo: {
              name: 'NatGeo',
              url: 'https://dev-sterna.estaleiro.serpro.gov.br/geo/api/tiles/NATGE/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            sat: {
              name: 'Satélite',
              url: 'https://dev-sterna.estaleiro.serpro.gov.br/geo/api/tiles/SAT/{z}/{x}/{y}.png',
              type: 'xyz'
            },
            terra: {
              name: 'Terra',
              url: 'https://dev-sterna.estaleiro.serpro.gov.br/geo/api/tiles/TERRA/{z}/{x}/{y}.png',
              type: 'xyz'
            }
          }
        }
      });
      $scope.metersPerPx =
        156543.03392 *
        Math.cos($scope.center.lat * Math.PI / 180) /
        Math.pow(2, 12);

      $scope.findAuxiliar();
      $scope.updateMap();
    }

    $scope.$on('leafletDirectiveMap.moveend', function (event, args) {
      var map = args.leafletEvent.target;
      $scope.center = map.getCenter();
      var zoom = map.getZoom();
      $scope.metersPerPx =
        156543.03392 *
        Math.cos($scope.center.lat * Math.PI / 180) /
        Math.pow(2, zoom);
      $scope.updateMap();
    });
  }
]);