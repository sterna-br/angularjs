'use strict';

app.factory('AuthService', [
  '$http',
  'AppService',
  '$rootScope',
  '$interval',
  'AlertService',
  function($http, AppService, $rootScope, $interval, AlertService) {
    var authService = {};

    authService.login = function(credentials) {
      AppService.removeToken();
      return $http({
        url: 'api/auth',
        method: 'POST',
        data: credentials
      }).then(function(res) {
        if (res.data.key) {
          AppService.setToken(res.data.key);
          $rootScope.currentUser = AppService.getUserFromToken();
        }
        return res;
      });
    };

    authService.social = function(social) {
      AppService.removeToken();
      return $http({
        url: 'api/auth/social',
        method: 'POST',
        data: social
      }).then(function(res) {
        if (res.data.key) {
          AppService.setToken(res.data.key);
          $rootScope.currentUser = AppService.getUserFromToken();
        }
        return res.data;
      });
    };

    authService.retoken = function() {
      return $http({
        url: 'api/auth',
        method: 'GET'
      }).then(function(res) {
        AppService.removeToken();
        AppService.setToken(res.data.key);
        $rootScope.currentUser = AppService.getUserFromToken();
        return res;
      });
    };

    $interval(function() {
      if ($rootScope.currentUser) {
        authService.retoken();
      }
    }, 333333);

    authService.logout = function() {
      AppService.removeToken();
    };

    authService.isAuthenticated = function() {
      if (!$rootScope.currentUser) {
        $rootScope.currentUser = AppService.getUserFromToken();
      }
      return $rootScope.currentUser ? true : false;
    };

    authService.isAuthorized = function(authorizedRoles) {
      if (authService.isAuthenticated()) {
        if (!angular.isArray(authorizedRoles)) {
          authorizedRoles = [authorizedRoles];
        }

        var hasAuthorizedRole = false;

        var perfil = $rootScope.currentUser.roles;

        if (perfil !== undefined && perfil !== null) {
          for (var i = 0; i < authorizedRoles.length; i++) {
            for (var p = 0; p < perfil.length; p++) {
              if (authorizedRoles[i] === perfil[p]) {
                hasAuthorizedRole = true;
                break;
              }
            }
          }
        }
      } else {
        return false;
      }

      return hasAuthorizedRole;
    };

    function urlBase64ToUint8Array(base64String) {
      const padding = '='.repeat((4 - base64String.length % 4) % 4);
      const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);

      for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }
      return outputArray;
    }

    return authService;
  }
]);
