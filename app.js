var app = angular.module("isteAdmin", ["ngRoute"]);

app.constant("liveSitesUrls",{
    localSiteUrl:"http://localhost:2010/",
    serverSiteUrl:"https://istegriet.herokuapp.com/",
    islocalenv:false
});
app.config(config)
    .run(run);

// config
config.$inject = ["$routeProvider"];

function config($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "homeCtrl"
        })
        .when("/newpost", {
            templateUrl: "views/newPost.html",
            controller: "newPostCtrl"
        });
} //config 

//run 
run.$inject = ["$rootScope", "fbase"];

function run($rootScope, fbase) {
    //init firebase now

    fbase.initFirebase();
    var connectedRef = firebase.database().ref(".info/connected");
    connectedRef.on("value", function (snap) {
        if (snap.val() === true) {
            // alert("Connected To Internet");
        } else {
            // alert("not connected to Internet");
        }
    });

} //run