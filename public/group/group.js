angular.module('app').component('group', {
    bindings: {
        groupObject: '=',
        groupMembers: '=',
        cards: '='
    },
    templateUrl: '/group/group.html',
    controller: function(fbRef, $firebaseArray, $firebaseAuthService, $ngBootbox, $firebaseObject, $location) {
        this.$onInit = function() {
            this.isCurrentUserOrganizer = ($firebaseAuthService.$getAuth().uid == this.groupObject.organizer);
        };
        
        this.addGroupMember = function(emailAddress) {
            var groupMembers = this.groupMembers;
            var groupObject = this.groupObject;
            
            // Make sure that the user to add exists in /users/
            var userRef = fbRef.getUsersRef().orderByChild('emailAddress').equalTo(emailAddress.toLowerCase());
            var userArray = $firebaseArray(userRef);
            
            userArray.$loaded().then(function() {
                if (userArray.length > 0) { // The user to add exists in /users/ 
                    var user = userArray[0];
                    
                    // Make sure that the user to add is not already in the group
                    var groupMembersHavingEnteredEmailAddress = groupMembers.filter(function(userObj) {
                        return userObj.emailAddress === user.emailAddress;
                    });
                    if (groupMembersHavingEnteredEmailAddress.length > 0) {
                        $ngBootbox.alert("This user is already in the group.");
                    } else {
                        // Add group to the user
                        var userGroupsRef = fbRef.getUsersRef().child(user.$id).child('groups').child(groupObject.$id);
                        userGroupsRef.set(true);
                        
                        // Add user to the group
                        var groupMembersRef = fbRef.getGroupsRef().child(groupObject.$id).child('members').child(user.$id);
                        groupMembersRef.set("");
                        
                        // Increment the number of users in the group
                        var noOfMembersRef = fbRef.getGroupsRef().child(groupObject.$id).child('noOfMembers');
                        noOfMembersRef.transaction(function(noOfMembers) {
                            return noOfMembers + 1;
                        });
                    }
                } else {
                    $ngBootbox.alert("No user found with the entered email address.");
                    return;
                }
            });
        }
        
        this.deleteGroupMember = function(user) {
            if (user.$id == $firebaseAuthService.$getAuth().uid) {
                $ngBootbox.alert("You cannot delete yourself.");
                return;
            }
            
            if (user.$id == this.groupObject.organizer) {
                $ngBootbox.alert("The group organizer cannot be deleted.");
                return;
            }
            
            // Delete the user from the group
            var groupMemberRef = fbRef.getGroupsRef().child(this.groupObject.$id).child('members').child(user.$id);
            $firebaseObject(groupMemberRef).$remove();
            
            // Delete the group from the user
            var userGroupRef = fbRef.getUsersRef().child(user.$id).child('groups').child(this.groupObject.$id);
            $firebaseObject(userGroupRef).$remove();
            
            // Decrement the number of users in the group
            var noOfMembersRef = fbRef.getGroupsRef().child(this.groupObject.$id).child('noOfMembers');
            noOfMembersRef.transaction(function (noOfMembers) {
                return noOfMembers - 1;
            });
        }
        
        this.getCardName = function(cardKey) {
            // cardKey contains the value stored in /groups/xx/members/yy (e.g. "21")
            // The function returns the name of the card with this key (e.g. /cards/fibonacci/21/name)
            var filteredArray = this.cards.filter(function(card) {
                return card.$id === cardKey;
            });
            return (filteredArray.length != 1) ? "Unknown" : filteredArray[0].name;
        }
        
        this.startGame = function() {
            var groupId = this.groupObject.$id;
            
            // Set isStarted=true, isViewResults=false
            var gameRef = fbRef.getGroupsRef().child(groupId).child('game');
            gameRef.child('isStarted').set(true);
            gameRef.child('isViewResults').set(false);
            
            // Empty the card value for all group members
            angular.forEach(this.groupMembers, function (member) {
                // /groups/<groupId>/members/<userId>
                var groupMemberRef = fbRef.getGroupsRef().child(groupId).child('members').child(member.$id);
                groupMemberRef.set("");
            });
            
            // Increment the number of games ever played
            var noOfGamesRef = fbRef.getBaseRef().child('noOfGames');
            noOfGamesRef.transaction(function(noOfGames) {
                return noOfGames+1;
            });
        }
        
        this.selectCard = function() {
            var groupId = this.groupObject.$id;
            $location.path("/selectcard/" + groupId);
        }
        
        this.viewResults = function() {
            var groupId = this.groupObject.$id;
            
            var isViewResultsRef = fbRef.getGroupsRef().child(groupId).child('game').child('isViewResults');
            isViewResultsRef.set(true);
        }
        
        this.endGame = function() {
            var groupId = this.groupObject.$id;
            
            // Set isStarted=false, isViewResults=false
            var gameRef = fbRef.getGroupsRef().child(groupId).child('game');
            gameRef.child('isStarted').set(false);
            gameRef.child('isViewResults').set(false);
            
            // Empty the card value for all group members
            angular.forEach(this.groupMembers, function (member) {
                // /groups/<groupId>/members/<userId>
                var groupMemberRef = fbRef.getGroupsRef().child(groupId).child('members').child(member.$id);
                groupMemberRef.set("");
            });
        }
    }
});