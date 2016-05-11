angular.module('app').component('groupList', {
    bindings: {
        groups: '='
    },
    templateUrl: '/groupList/groupList.html',
    controller: function($firebaseAuthService, $firebaseObject, fbRef, $firebaseArray, $location, $ngBootbox) {
        
        this.createGroup = function(groupName) {
            var uid = $firebaseAuthService.$getAuth().uid;
            var newGroup = {game: { isStarted: false, isViewResults: false }, members: {[uid]: ''}, method: 'fibonacci', name: groupName, noOfMembers: 1, organizer: uid};
            var groupsArray = $firebaseArray(fbRef.getGroupsRef());
            groupsArray.$add(newGroup).then(function(ref) {
                var newGroupId = ref.key();
                
                var userGroupsRef = fbRef.getCurrentUserRef().child('groups').child(newGroupId);
                userGroupsRef.set(true);
            });
        }
        
        this.editGroup = function(group, groupName) {
            var ref = fbRef.getGroupsRef().child(group.$id);
            var groupObject = $firebaseObject(ref);
            groupObject.$loaded().then(function() {
                groupObject.name = groupName;
                groupObject.$save();
            });
        }
        
        this.deleteGroup = function(group) {
            // Make sure that the current user is the group organizer
            if (group.organizer !== $firebaseAuthService.$getAuth().uid) {
                $ngBootbox.alert("A group can only be deleted by its organizer.");
                return;
            }
            
            // Delete the selected group for each group member
            var groupMembersRef = fbRef.getGroupsRef().child(group.$id).child('members');
            var groupMembersArray = $firebaseArray(groupMembersRef);
            
            groupMembersArray.$loaded().then(function() {
                angular.forEach(groupMembersArray, function(user) { // For each member, remove the group from the list of groups he's allowed to see
                    var userGroupRef = fbRef.getUsersRef().child(user.$id).child('groups').child(group.$id);
                    $firebaseObject(userGroupRef).$remove();
                });
                
                // Delete group
                var groupRef = fbRef.getGroupsRef().child(group.$id);
                $firebaseObject(groupRef).$remove();
            });
        }
    }
});