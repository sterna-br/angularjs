'use strict';

app.factory('CategoryService', [
  '$http',
  function ($http) {
    var service = {};

    service.mapa = function (tipo, category, group, lat, lng, zoom) {
      return $http
        .get(
          'api' + '/' +
          tipo +
          '/' +
          category +
          '/' +
          group +
          '/' +
          lat +
          '/' +
          lng +
          '/' +
          zoom
        )
        .then(function (res) {
          return res.data;
        });
    };

    service.mapaAll = function (tipo, category, lat, lng, zoom) {
      return $http
        .get('api/' + tipo + '/' + category + '/' + lat + '/' + lng + '/' + zoom)
        .then(function (res) {
          return res.data;
        });
    };

    service.categorys = function (tipo) {
      return $http.get('api/' + tipo + '/category/').then(function (res) {
        return res.data;
      });
    };

    service.groups = function (tipo, category) {
      return $http.get('api/' + tipo + '/group/' + category).then(function (res) {
        return res.data;
      });
    };

    service.center = function () {
      return $http.get('https://cep.demoiselle.estaleiro.serpro.gov.br/app/api/ip2locations').then(function (res) {
        return res.data;
      });
    };

    return service;
  }
]);