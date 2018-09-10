'use strict';

var app = angular
  .module('app', [
    'ngRoute',
    'ngSanitize',
    'angular-loading-bar',
    'leaflet-directive',
    'angular-google-analytics',
    'Config'
  ])
  .config([
    '$routeProvider',
    '$httpProvider',
    'USER_ROLES',
    'AnalyticsProvider',
    function ($routeProvider, $httpProvider, USER_ROLES, AnalyticsProvider) {

      AnalyticsProvider.setAccount('UA-33820437-4');
      AnalyticsProvider.trackPages(true);

      $routeProvider.otherwise({
        redirectTo: '/dashboard',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/dashboard'
      });

      $routeProvider.when('/403', {
        templateUrl: 'views/403.html',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        }
      });

      $routeProvider.when('/dashboard', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'DashboardController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/dashboard'
      });

      $routeProvider.when('/health', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'HealthController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/health'
      });

      $routeProvider.when('/school', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'SchoolController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/school'
      });

      $routeProvider.when('/gastronomy', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'GastronomyController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/gastronomy'
      });

      $routeProvider.when('/financial', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'FinancialController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/financial'
      });

      $routeProvider.when('/government', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'GovernmentController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/government'
      });

      $routeProvider.when('/domingo', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'DomingoController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/domingo'
      });

      $routeProvider.when('/policia', {
        templateUrl: 'views/dashboard/category.html',
        controller: 'PoliciaController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/policia'
      });

      $routeProvider.when('/custom', {
        templateUrl: 'views/dashboard/custom.html',
        controller: 'CustomController',
        data: {
          authorizedRoles: [USER_ROLES.NOT_LOGGED]
        },
        pageTrack: '/custom'
      });
    }
  ]);

app.config([
  '$httpProvider',
  function ($httpProvider) {
    $httpProvider.useApplyAsync(true);
    $httpProvider.interceptors.push([
      '$q',
      '$rootScope',
      'AppService',
      'ENV',
      function ($q, $rootScope, AppService, ENV) {
        return {
          request: function (config) {
            $rootScope.$broadcast('loading-started');
            var token = AppService.getToken();
            if (config.url.indexOf('http') === -1) {
              if (config.url.indexOf('api') !== -1) {
                config.url = ENV.apiEndpoint + config.url;
              }
            }

            // if (token) {
            //   config.headers['Authorization'] = 'JWT ' + token;
            // }

            return config || $q.when(config);
          },
          response: function (response) {
            $rootScope.$broadcast('loading-complete');
            return response || $q.when(response);
          },
          responseError: function (rejection) {
            $rootScope.$broadcast('loading-complete');
            return $q.reject(rejection);
          },
          requestError: function (rejection) {
            $rootScope.$broadcast('loading-complete');
            return $q.reject(rejection);
          }
        };
      }
    ]);
    $httpProvider.interceptors.push([
      '$injector',
      function ($injector) {
        return $injector.get('AuthInterceptor');
      }
    ]);
  }
]);

app.run([
  '$rootScope',
  '$location',
  '$window',
  'AUTH_EVENTS',
  'APP_EVENTS',
  'USER_ROLES',
  'AuthService',
  'AppService',
  'AlertService',
  'Analytics',
  function (
    $rootScope,
    $location,
    $window,
    AUTH_EVENTS,
    APP_EVENTS,
    USER_ROLES,
    AuthService,
    AppService,
    AlertService,
    Analytics
  ) {
    $rootScope.$on('$routeChangeStart', function (event, next) {
      if (next.redirectTo !== '/') {
        var authorizedRoles = next.data.authorizedRoles;
        if (
          authorizedRoles[0] !== undefined &&
          authorizedRoles.indexOf(USER_ROLES.NOT_LOGGED) === -1
        ) {
          if (!AuthService.isAuthorized(authorizedRoles)) {
            event.preventDefault();
            if (AuthService.isAuthenticated()) {
              // user is not allowed
              $rootScope.$broadcast(AUTH_EVENTS.notAuthorized);
            } else {
              // user is not logged in
              $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
            }
          }
        }
      }
    });

    $rootScope.$on(AUTH_EVENTS.quantidade, function (emit, args) {
      $rootScope.$apply(function () {
        $rootScope.conectados = args.emit.data;
      });
    });

    $rootScope.$on('event:social-sign-in-success', function (
      event,
      userDetails
    ) {
      AuthService.social(userDetails).then(
        function (res) {
          $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        },
        function (res) {
          AlertService.addWithTimeout(
            'warning',
            'Os servidores do google/facebook não identificaram o seu email que está cadastrado no sistema'
          );
        }
      );
    });

    $rootScope.$on('event:social-sign-out-success', function (
      event,
      logoutStatus
    ) {});

    $rootScope.$on(AUTH_EVENTS.notAuthorized, function () {
      console.log('notAuthorized');
      $location.path('/403');
    });

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      console.log('notAuthenticated');
      $rootScope.currentUser = null;
      AppService.removeToken();
      $location.path('/login');
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
      console.log('sessionTimeout');
    });

    $rootScope.$on(AUTH_EVENTS.loginFailed, function () {
      console.log('loginFailed');
      AppService.removeToken();
      $location.path('/login');
    });

    $rootScope.$on(AUTH_EVENTS.logoutSuccess, function () {
      console.log('logoutSuccess');

      $rootScope.currentUser = null;
      AppService.removeToken();
      $location.path('/dashboard');
    });

    $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
      $location.path('/dashboard');
    });

    $rootScope.$on(APP_EVENTS.offline, function () {
      AlertService.addWithTimeout(
        'danger',
        'Servidor esta temporariamente indisponível, tente mais tarde'
      );
    });

    // Check if a new cache is available on page load.
    $window.addEventListener(
      'load',
      function (e) {
        $window.applicationCache.addEventListener(
          'updateready',
          function (e) {
            console.log($window.applicationCache.status);
            if (
              $window.applicationCache.status ===
              $window.applicationCache.UPDATEREADY
            ) {
              // Browser downloaded a new app cache.
              $window.location.reload();
              alert('Uma nova versão será carregada!');
            }
          },
          false
        );
      },
      false
    );
  }
]);

app.constant('APP_EVENTS', {
  offline: 'app-events-offline'
});

app.constant('AUTH_EVENTS', {
  loginSuccess: 'auth-login-success',
  loginFailed: 'auth-login-failed',
  logoutSuccess: 'auth-logout-success',
  sessionTimeout: 'auth-session-timeout',
  notAuthenticated: 'auth-not-authenticated',
  notAuthorized: 'auth-not-authorized',
  exit: 'exit',
  sistema: 'sistema',
  mensagem: 'mensagem',
  produto: 'produto',
  fase: 'fase',
  quantidade: 'qtde'
});

app.constant('USER_ROLES', {
  USUARIO: 'Usuario',
  VISITANTE: 'Visitante',
  GERENTE: 'Gerente',
  ADMINISTRADOR: 'Administrador',
  NOT_LOGGED: 'NOT_LOGGED'
});

app.factory('AuthInterceptor', [
  '$rootScope',
  '$q',
  'AUTH_EVENTS',
  'APP_EVENTS',
  function ($rootScope, $q, AUTH_EVENTS, APP_EVENTS) {
    return {
      responseError: function (response) {
        $rootScope.$broadcast({
            0: APP_EVENTS.offline,
            404: APP_EVENTS.offline,
            503: APP_EVENTS.offline,
            401: AUTH_EVENTS.notAuthenticated,
            403: AUTH_EVENTS.notAuthorized,
            419: AUTH_EVENTS.sessionTimeout,
            440: AUTH_EVENTS.sessionTimeout
          }[response.status],
          response
        );

        return $q.reject(response);
      }
    };
  }
]);

app.value('version', '1.0.0');