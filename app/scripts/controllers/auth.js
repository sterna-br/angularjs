'use strict';

app.controller('AuthController', [
  '$q',
  '$scope',
  '$rootScope',
  'AUTH_EVENTS',
  'AuthService',
  'ValidationService',
  'CategoryService',
  function ($q, $scope, $rootScope, AUTH_EVENTS, AuthService, ValidationService, CategoryService) {

    $rootScope.mapas = ['OSM', 'OTM'];
    $rootScope.mapa = 'OSM';

    if (!$rootScope.local) {
      $q
        .all([
          CategoryService.center()
        ])
        .then(function (result) {
          $rootScope.local = result[0];
        });
    }

    $scope.credentials = {
      username: 'admin@demoiselle.org',
      password: '123456'
    };

    function error(data, status) {
      $("[id$='-message']").text('');
      switch (status) {
        case 412:
        case 422:
          $.each(data, function (i, violation) {
            $('#' + violation.property + '-message').text(violation.message);
          });
          break;
        case 401:
          $('#message').html('Usuário ou senha inválidos.');
          break;
      }
    }

    $scope.login = function (credentials) {
      ValidationService.clear();
      if (credentials.username && credentials.password) {
        AuthService.login(credentials).then(
          function (res) {
            $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
          },
          function (res) {
            var data = res.data[0].error;
            var status = res.status;
            var message = res.message;

            if (status === 401) {
              AlertService.addWithTimeout('warning', data);
            } else if (status === 412 || status === 422) {
              ValidationService.registrarViolacoes(data);
            } else if (status === 403) {
              AlertService.showMessageForbiden();
            }
          }
        );
      } else {
        AlertService.addWithTimeout('warning', 'Informe usuário e senha');
      }
    };

    $scope.logout = function () {
      $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
    };

  }
]);