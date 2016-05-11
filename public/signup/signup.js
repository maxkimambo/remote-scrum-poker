angular.module('app').component('signup', {
    templateUrl: '/signup/signup.html',
    controller: function($location, $ngBootbox, $scope, $firebaseRef, $firebaseAuthService, $firebaseArray, fbRef, usSpinnerService) {
        this.createAccount = function() {
            usSpinnerService.spin('spinner-1');

            $firebaseRef.default.createUser({
                email: $scope.emailaddress,
                password: $scope.password
            }, function(error, userData) {
                usSpinnerService.stop('spinner-1');
                
                if (error) {
                    $ngBootbox.alert("The user could not be created: " + error);
                } else {
                    $firebaseAuthService.$authWithPassword({
                        email: $scope.emailaddress,
                        password: $scope.password
                    }).then(function(authData) {
                        var newUser = {
                            emailAddress: $scope.emailaddress,
                            isOnline: true,
                            provider: authData.provider,
                            createdOn: new Date().toLocaleString() 
                        };
                        
                        fbRef.getUsersRef().child(authData.auth.uid).set(newUser);
                        $location.path('/home');
                    }).catch(function(error) {
                        $ngBootbox.alert("Authentication failed: " + error);
                    });
                }
            });
        }
    }
});