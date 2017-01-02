var app = angular.module("isteAdmin", ["ngRoute"]);

app.constant("liveSitesUrls", {
    localSiteUrl: "http://localhost:2010/",
    serverSiteUrl: "https://istegriet.herokuapp.com/",
    islocalenv: false
});

    app
    .controller('navigationCtrl', navigationCtrl)
    .config(config)
    .run(run);

    function navigationCtrl($rootScope){
        nctrl = this;
        $rootScope.$on("$routeChangeSuccess",function(event,current,previous){
                     nctrl.activetab = current.$$route.activetab;
        });
    }//controller


// config
config.$inject = ["$routeProvider"];

function config($routeProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "views/home.html",
            controller: "homeCtrl",
            activetab:"home"
        })
        .when("/newpost", {
            templateUrl: "views/newPost.html",
            controller: "newPostCtrl",
            activetab:"newpost"
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