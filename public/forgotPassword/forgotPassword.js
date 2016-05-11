angular.module('app').component('forgotPassword', {
    templateUrl: '/forgotPassword/forgotPassword.html',
    controller: function($location, $ngBootbox, $scope, $firebaseRef) {
        this.resetPassword = function() {
            $firebaseRef.default.resetPassword({
                email: $scope.emailaddress
            }).then(function () {
                $ngBootbox.alert("Password reset email sent successfully!");
                $location.path('/login');
            }).catch(function (error) {
                $ngBootbox.alert(error);
            });
        }
    }
});