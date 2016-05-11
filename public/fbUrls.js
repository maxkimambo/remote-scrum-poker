angular.module('app').config(function($firebaseRefProvider) {
    $firebaseRefProvider.registerUrl('https://remote-scrum-poker.firebaseio.com/');
})