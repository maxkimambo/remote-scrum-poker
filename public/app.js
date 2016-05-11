
var app = angular.module('app', ['ngRoute', 'firebase', 'ngBootbox', 'angularSpinner']);

app.run(function ($rootScope, $location, $firebaseRef, $firebaseAuth, fbRef) {
    $rootScope.$on("$routeChangeError", function (e, next, prev, err) {
        if (err === "AUTH_REQUIRED") {
            $location.path("/login");
        }
    });
    
    $firebaseAuth($firebaseRef.default).$onAuth(function(authData) {
        if (authData) {
            // Set /users/xxx/isOnline to true when the user is authenticated
            var isOnlineRef = fbRef.getCurrentUserRef().child('isOnline');
            isOnlineRef.set(true);
            
            // Mark the user as offline when the user is disconnected
            isOnlineRef.onDisconnect().set(false);
        }
    });
});

app.config(function ($routeProvider) {
    $routeProvider
        .when('/home', {
            template: '<home groups="$resolve.groups"></home>',
            resolve: {
                groups: function($firebaseAuthService, $firebaseArray, fbRef) {
                    return $firebaseAuthService.$requireAuth().then(function() {
                        var userGroupsRef = fbRef.getCurrentUserRef().child('groups');
                        var groupsRef = fbRef.getGroupsRef();

                        var query = new Firebase.util.NormalizedCollection(
                                [userGroupsRef, 'userGroups'],
                                [groupsRef, 'groups'])
                            .select(
                                "groups.name", 
                                "groups.noOfMembers",
                                "groups.organizer",
                                {"key": "userGroups.$value"}
                            ).ref();

                        return $firebaseArray(query);
                    })
                }
            }
        })
        .when('/group/:groupId', {
            template: '<group group-members="$resolve.groupMembers" group-object="$resolve.groupObject" cards="$resolve.cards"></group>',
            resolve: {
                groupObject: function ($firebaseAuthService, $firebaseObject, fbRef, $route) {
                    return $firebaseAuthService.$requireAuth().then(function () {
                        var groupId = $route.current.params.groupId;
                        var groupRef = fbRef.getGroupsRef().child(groupId);
                        return $firebaseObject(groupRef).$loaded();
                    });
                },
                groupMembers: function ($firebaseAuthService, $firebaseArray, fbRef, $route) {
                    var groupId = $route.current.params.groupId;
                    
                    return $firebaseAuthService.$requireAuth().then(function () {
                        var userGroupsRef = fbRef.getGroupsRef().child(groupId).child('members');
                        var usersRef = fbRef.getUsersRef();

                        var query = new Firebase.util.NormalizedCollection(
                                [userGroupsRef, 'userGroups'],
                                [usersRef, 'users']
                            ).select(
                                "users.$key",
                                "users.emailAddress",
                                "users.isOnline",
                                { "key": "userGroups.$value", alias: 'cardKey' }
                            ).ref();

                        return $firebaseArray(query);
                    })
                },
                cards: function($firebaseAuthService, $firebaseArray, fbRef) {
                    return $firebaseAuthService.$requireAuth().then(function () {
                        var cardsRef = fbRef.getCardsRef().child('fibonacci');
                        return $firebaseArray(cardsRef);
                    })
                }
            }
        })
        .when('/selectcard/:groupId', {
            template: '<select-card></select-card>'
        })
        .when('/signup', {
            template: '<signup></signup>'
        })
        .when('/forgotPassword', {
            template: '<forgot-password></forgot-password>'
        })
        .when('/help', {
            template: '<help></help>'
        })
        .when('/login', {
            template: '<login current-auth="$resolve.currentAuth"></login>',
            resolve: {
                currentAuth: function ($firebaseAuthService) {
                    return $firebaseAuthService.$waitForAuth();
                }
            }
        })
        .when('/logout', {
            template: '<logout></logout>'
        })
        .otherwise('/home')
});