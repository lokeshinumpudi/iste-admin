angular
    .module("isteAdmin")
    .factory("fbase", fbase);


fbase.$inject = ["$q"];

function fbase($q) {

    //global db connection
    var db = null;

    function initFirebase() {
        // Initialize Firebase
        var config = {
            apiKey: "AIzaSyAloyBtmX8_MEdzrz5-Ju5kZC-4UjxWbNY",
            authDomain: "istegriet-bb890.firebaseapp.com",
            databaseURL: "https://istegriet-bb890.firebaseio.com",
            storageBucket: "istegriet-bb890.appspot.com",
            messagingSenderId: "711321350575"
        };

            firebase.initializeApp(config);

           
            firebase.auth()
                    .signInAnonymously()
                    .catch(function(e){
                        var errorCode = e.code;
                        var errorMessage = e.message;
                        console.error(errorCode);
                    });

                        
           
    } //initFirebase

    function uploadImages(file) {
        // console.log(file);
        var deferred = $q.defer();
        var storageRef = firebase.storage().ref();
        // our custom meta data
        var customMeta = {
            "customMetadata": {
                'localImageUrl': file.localImageUrl
            }
        };

        var filename = Date.now() + file.name;

        try {
            storageRef.child("images/" + filename).put(file, customMeta).then(function (snap) {
                // console.log(snap.metadata);
                deferred.resolve(snap.metadata);
            }).catch(function (err) {
                console.error("Upload failed:", err);
                deferred.reject(err);
            }); //storageRef.put

        } catch (e) {
            console.error(e);
        }
        //async
        return deferred.promise;

    }; //uploadImages


    function uploadPost(postData) {
        var deferred = $q.defer();

        var db = firebase.database();
        var dataref = db.ref("data/allEvents");

        //to store the firebase key into the object
        var childRef = dataref.push();
        var childKey = childRef.key;
        //store the key into object
        postData.hash = childKey;

        //set the data to database
        childRef.set(postData, function (err) {
            if (err) {
                //error
                deferred.reject(err);
            } else {
                //success 
                deferred.resolve();
            }
        });

        //return a promise
        return deferred.promise;


    } //uploadPost


    function getAllPosts() {
        var deferred = $q.defer();

        db = firebase.database();
        //get a reference
        db.ref("data/allEvents").orderByKey().once("value").then(function (snapshot) {
            // console.log(snapshot.val());
            deferred.resolve(snapshot.val());
        }).catch(function (err) {
            console.error(err);
            deferred.reject(err);
        });

        return deferred.promise;
    } //getAllPosts


    //using meta deletes the file from storage
    function deleteImageFromStorage(meta) {

    } //deleteImageFromStorage


    //update an already saved post
    function updatePost(dataobj) {
        var deferred = $q.defer();
        // console.log(dataobj);
        var refId = dataobj.hash;

        if (db == null) {
            db = firebase.database();
        }

        db.ref("data/allEvents").child(refId).set(dataobj, function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve({
                    text: "Edit success"
                });
            }
        }); //db ref

        return deferred.promise;

    } //update post





    var service = {
        initFirebase: initFirebase,
        uploadImages: uploadImages,
        uploadPost: uploadPost,
        getAllPosts: getAllPosts,
        deleteImageFromStorage: deleteImageFromStorage,
        updatePost: updatePost

    };

    return service;

} //fbase