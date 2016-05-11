angular.module('app').component('logout', {
    controller: function($firebaseAuthService, $location, fbRef) {
        // Mark the user as offline 
        fbRef.getCurrentUserRef().child('isOnline').set(false);
        
        $firebaseAuthService.$unauth();
        $location.path('/login');
    }
})