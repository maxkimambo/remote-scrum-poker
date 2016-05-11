angular.module('app').factory('fbRef', function($firebaseRef, $firebaseAuthService) {
    return {
        getBaseRef: function() {
            return $firebaseRef.default;
        },
        getCurrentUserRef: function() {
            return $firebaseRef.default.child('users').child($firebaseAuthService.$getAuth().uid);
        },
        getGroupsRef: function() {
            return $firebaseRef.default.child('groups');
        },
        getUsersRef: function() {
            return $firebaseRef.default.child('users');
        },
        getCardsRef: function() {
            return $firebaseRef.default.child('cards');
        }
    }
})