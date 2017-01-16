angular.module("isteAdmin")
    .controller("homeCtrl", homeCtrl);

homeCtrl.$inject = ["$scope", "fbase","$location"];

function homeCtrl($scope, fbase,$location) {
    // intially empty
    $scope.editPostData = null;
    // current state of edit
    $scope.underEditing = false;
    //all posts data
    $scope.allPosts = null;
    //Entire data of posts  
    fbase.getAllPosts().then(function (data) {
        $scope.allPosts = data;
    }).catch(function (err) {
        console.error(err);
    }); //getAllPosts
    $scope.getSelectedPost = function (post) {
        // todo: easy switching between posts 
            if (!$scope.underEditing) {
                console.log(post);
                // if not under already editing mode update the editing model data 
                $scope.editPostData = post;
            } else {
                alert("Post under editing already! Refresh and select new post to edit");
                $location.reload();

            }
            $scope.underEditing = true;
         
        } //getSelectedPost
} //controller end

angular.module("isteAdmin")
    .directive("scrollingPosts", scrollingPosts);

// scrollingPosts.$inject= [];
function scrollingPosts() {
    return {
        replace: true,
        scope: {
            data: "=",
            callfnc: "&"
        },
        templateUrl: "partials/scrollingposts.html",
        link: function ($scope, $ele, $attrs) {
            $scope.selectPostToEdit = function (post) {
                    //check if post is editable(i.e new post wich was uploaded through this service)
                    if (post.isPostEditable != undefined && post.isPostEditable) {
                        //send this post to parent controller so edit directive can get this data
                        $scope.callfnc({
                            message: post
                        });
                    } else {
                        alert("This post cant be edited! Scroll down");
                    }
                } //editPost
        }
    } //return
}; //end directive