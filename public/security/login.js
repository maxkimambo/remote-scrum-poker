angular.module('app').component('login', {
    templateUrl: '/security/login.html',
    bindings: {
        currentAuth: '='
    },
    controller: function($firebaseAuthService, $location, $ngBootbox, $scope, usSpinnerService) {
        this.emailLogin = function() {
            usSpinnerService.spin('spinner-1');
            $firebaseAuthService.$authWithPassword({
                email: $scope.emailaddress,
                password: $scope.password
            }).then(function() {
                usSpinnerService.stop('spinner-1');
                $location.path('/home');
            }).catch((function(err) {
                usSpinnerService.stop('spinner-1');
                $ngBootbox.alert("The username or password is incorrect.");
            }).bind(this))
        }
    }
})