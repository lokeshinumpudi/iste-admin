angular
    .module("isteAdmin")
    .controller("newPostCtrl", newPostCtrl);


newPostCtrl.$inject = ["$scope"];

function newPostCtrl($scope) {
            $scope.wtf = "what";

} //newPostCtrl