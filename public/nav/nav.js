angular.module('app').component('nav', {
    templateUrl: '/nav/nav.html',
    controller: function($firebaseObject, fbRef, $scope) {
        this.loaded = false;
        
        var userDataObject = $firebaseObject(fbRef.getCurrentUserRef());
        
        userDataObject.$loaded().then((function(data) {
            this.loaded = true;
            this.userData = userDataObject.$bindTo($scope, "$ctrl.userData");
        }).bind(this));
    }
});