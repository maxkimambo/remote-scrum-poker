angular.module('app').component('selectCard', {
    templateUrl: '/selectCard/selectCard.html',
    controller: function(fbRef, $firebaseArray, $route, $firebaseObject, $firebaseAuthService, $location) {
        this.$onInit = function() {
            var cardsRef = fbRef.getCardsRef().child('fibonacci');
            this.cards = $firebaseArray(cardsRef);

            this.groupId = $route.current.params.groupId;
            
            var groupRef = fbRef.getGroupsRef().child(this.groupId);
            this.group = $firebaseObject(groupRef);
        };
        
        this.selectCard = function(card) {
            var uid = $firebaseAuthService.$getAuth().uid;
            
            var groupMemberCardRef = fbRef.getGroupsRef().child(this.groupId).child('members').child(uid)
            groupMemberCardRef.set(card.$id); // Set the key of the selected card in /groups/<currentGroupKey>/members/<uid>
            
            $location.path("/group/" + this.groupId);
        };
    }
});