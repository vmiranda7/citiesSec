angular.module('cities', ['ngRoute', 'ngCookies','ui.bootstrap','ngImgCrop','btford.socket-io'])
    .run(['$rootScope', 'socketio','$cookies','$window', function ($rootScope, socket, $cookies,$window) {
        $rootScope.clientKeys = rsaInt.generateKeys(512);
        if (angular.isUndefined($cookies.get('user'))){
            $rootScope.isLogged=false;
        }
        else{
            $window.location.href = 'https://localhost:8080/#/shop';
            $rootScope.userLog = JSON.parse($cookies.get('user'));
            $rootScope.isLogged = true;
            socket.connect();
            $rootScope.chat = [];
            $rootScope.keys = {};
            $rootScope.keys.module = '';
            $rootScope.keys.random = '';
            $rootScope.keys.id = '';
            $rootScope.keys.username = '';
            $rootScope.keys.secret = '';

            if($window.location.href!="https://localhost:8080"){
                $cookies.remove('user');
            }
            socket.on('connection', function (data) {
                socket.emit('username', $rootScope.userLog.username);
            });
            socket.on('diffieInit', function(data){
                //$rootScope.keys.random = getRandomInt(1, data.prime-1);
                $rootScope.keys.random = bigInt.randBetween(1, 10);
                $rootScope.keys.module = getModule(data.prime, data.mod, $rootScope.keys.random);
                console.log($rootScope.keys.module);
                $rootScope.keys.username = data.user;
                $rootScope.keys.id = data.id;
                socket.emit('diffie', {module: $rootScope.keys.module, id: data.id, user: data.user, mod: data.mod, prime:data.prime});
            });
            socket.on('diffie', function(data){
                $rootScope.keys.secret = getModule(data.prime, data.mod, data.module);
                $rootScope.chat.push($rootScope.keys);
                console.log($rootScope.keys.secret);
            });

            function getRandomInt(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }
            function getModule(p, g, number){
                console.log(g);
                console.log(number);
                var a = bigInt(g).pow(number);
                console.log(a);
                console.log(a.mod(p));
                return a.mod(p)
            }
        }
    }])
    .factory('socketio', ['$rootScope', function($rootScope){
        var socketUrl = "https://localhost:3040";
        var socket = null;
        return {
            connect: function () {
                socket = io.connect(socketUrl, {reconnect: true});
                console.log(socket);

            },
            on: function(eventName, callback){
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function(){
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args= arguments;
                    $rootScope.$apply(function () {
                        if(callback){
                            callback.apply(socket,args);
                        }
                    });
                });
            },
            disconnect: function () {
                socket.disconnect();
            }
        }
    }])
    .config(['$routeProvider','$locationProvider', function ($routeProvider, $locationProvider) {
        $routeProvider
            .when('/', {
                templateUrl: 'templates/pages/principal.html',
                controller: 'PrincipalController'
            })
            .when('/shop', {
                templateUrl: 'templates/pages/anuncios.html',
                controller: 'ShopController'
            })
            .when('/login', {
                templateUrl: 'templates/pages/loginRegistration.html',
                controller: 'LoginController'
            })
            .when('/anonimous/login', {
                templateUrl: 'templates/pages/anonimousLogin.html',
                controller: 'AnonimousController'
            })
            .when('/loginTest', {
                templateUrl: 'templates/pages/testLogin.html',
                controller: 'AnonimousController'
            })
            .when('/create', {
                templateUrl: 'templates/pages/createAd.html',
                controller: 'CreateadController'
            })
            .when('/edit', {
                templateUrl: 'templates/pages/EditProduct.html',
                controller: 'EditProduct'
            })
            .when('/products', {
                templateUrl: 'templates/pages/products.html',
                controller: 'ProductsController'
            })
            .when('/chat', {
                templateUrl: 'templates/pages/chat.html',
                controller: 'ChatController'
            })
            .when('/details/:id', {
                templateUrl: 'templates/pages/details.html',
                controller: 'DetailsController'
            })
    }])

