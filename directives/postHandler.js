angular.module("isteAdmin")
    .directive("post", post);

post.$inject = ["fbase", "liveSitesUrls"];

function post(fbase, liveSitesUrls) {
    return {
        replace: true,
        restrict: "EA",
        scope: {
            posttype: "@",
            postdata: "="
        },
        controller: function ($scope, $element) {
            $scope.months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JULY", "AUG", "SEPT", "OCT", "NOV", "DEC"];
            // $scope.formData = {
            //     registrationDetails: {}
            // };
            if ($scope.postdata != undefined) {
                if ($scope.postdata.galleryFilesStorageMeta == undefined) {
                    $scope.postdata.galleryFilesStorageMeta = [];
                }

                if ($scope.postdata.gallery == undefined) {
                    $scope.postdata.gallery = [];
                }

            }

            if ($scope.posttype == 'editPost') {
                $scope.postSubmitTypeText = "Update Post";
            } else {
                $scope.postSubmitTypeText = "Publish Post";
            }

            var mockDataStructure = {
                "title": "My wonderful custom event",
                "description": " A festival is never a festival without fun and entertainment. MELA included 5 non technical events providing students all the joy and entertainment.",
                "topics": ["1.Ad-Mania", "2.Directions in the dark", "3.Crime Scene Investigation", "4Count down 60", "5.Moto Rush"],
                "description_para1": "They were equally planned and executed perfectly and hence managed to gather a large audience and left all the events extremely satisfied.",
                "date_full": "",
                "description_para2": "asd",
                "year": 2016,
                "month": "MAR",
                "day": 30,
                "title_img_src": "nontech.jpg",
                "titleImgStorageMeta": {},
                "hash": "",
                isPostEditable: "",
                "event_link": "",
                "gallery": ["nt1.JPG", "nt2.JPG", "nt3.jpg", "nt4.jpg"],
                "galleryFilesStorageMeta": [],
                "imagedirectory": "",
                "registrationDetails": {
                    "room_no": "1st Year Block",
                    "timings": "10 am to 4 pm",
                    "contact_no": 90000380480
                }
            };
            //data received under edit mode
            if ($scope.posttype == "editPost") {
                $scope.formData = $scope.postdata;
            } else {
                //data for newPost
                // For testing
                $scope.formData = mockDataStructure;
            }

            //final object to be sent to server
            var finalPostObj = {};

            //globals
            //track if title and gallery images uploaded
            $scope.isBothUploadsReceivedCount = 0;
            var title_img_src;
            var gallery = [];
            //To make sure client code doesnt break and no changes needed
            var imagedirectory = "";
            //store the file storagePath
            var galleryFilesStorageMeta;
            var titleImgStorageMeta;

            //used to clear local data after a post is done uploading
            function clearTemp() {
                gallery = [];
                title_img_src = "";
                galleryFilesStorageMeta = [];
                titleImgStorageMeta = {};
                //reset counter
                $scope.isBothUploadsReceivedCount = 0;
                //also call the fileHandler child directives to remove the file selections
                $scope.formData = {};
            }

            //determine to update or submit form content
            $scope.submitForm = function () {
                if ($scope.posttype == "editPost") {
                    updatePost();
                    return;
                }
                publishPost();
            };

            function publishPost() {
                //check if both files are uploaded
                if ($scope.isBothUploadsReceivedCount == 2) {
                    prepareFinalObject();
                    finalPostObj.gallery = gallery;
                    finalPostObj.galleryFilesStorageMeta = galleryFilesStorageMeta;
                    finalPostObj.title_img_src = title_img_src;
                    finalPostObj.titleImgStorageMeta = titleImgStorageMeta;

                    fbase.uploadPost(finalPostObj).then(function () {
                        // console.log("upload success");
                        alert("Post uploaded");
                        clearTemp();
                        //clean up to ensure he doesnt post again
                    }).catch(function (err) {
                        console.error(err);
                        alert("Upload failed! Try uploading again");
                        //TODO: since upload to database failed try to clean up the files that are uploaded
                    });
                } else {
                    alert("No gallery Images uploaded! select images and click finish");
                }
            } //publishPost  end

            var prepareFinalObject = function () {
                //fill the object to send to firebase
                Object.keys(mockDataStructure).forEach(function (eachKey) {
                    finalPostObj[eachKey] = $scope.formData[eachKey];
                });
                //All these posts are editable in future!
                finalPostObj.isPostEditable = true;
                //add time to the event link to prevent duplicates
                finalPostObj.event_link = "#/event/" + finalPostObj.title.split(" ").join("_") + ":" + Date.now();
            };

            function updatePost() {
                //finally Ready to update to firebase
                //check if images are not empty
                var hasTitleImage = $scope.postdata.title_img_src != null;
                var hasGallery = $scope.postdata.gallery.length > 0;

                // console.log(hasTitleImage, hasGallery);
                if (!hasTitleImage || !hasGallery) {
                    alert("select images!");
                    return;
                }
                prepareFinalObject();
                // console.log(finalPostObj);
                fbase.updatePost(finalPostObj).then(function (res) {
                    // console.log("upload success");
                    alert("Upload success!");
                    console.log($scope.postdata);

                    var envurl = liveSitesUrls.islocalenv === true ? liveSitesUrls.localSiteUrl : liveSitesUrls.serverSiteUrl   ;
                    $scope.liveUrl = envurl + finalPostObj.event_link;
                    //clean up to ensure he doesnt post again
                }).catch(function (err) {
                    console.error(err);
                    alert("Upload failed! Try uploading again");
                    //TODO: since upload to database failed try to clean up the files that are uploaded
                });

            } //updatePost

            //returns obj{meta:,index:} when given a particular url 
            function getStorageMeta(url) {

                var metaobj = {
                    meta: {},
                    index: null
                };

                $scope.postdata.galleryFilesStorageMeta.forEach(function (eachFileStorageMeta, index) {
                    if (eachFileStorageMeta.url === url) {
                        metaobj.meta = eachFileStorageMeta;
                        metaobj.index = index;
                    }
                });
                return metaobj;

            } //getMetaFromUrl

            //Api for child directives to talk to us
            //this is for server received images 
            this.removeImage = function (removedImageArray, isMultiple) {
                //tells if this image is received from single image or multiple images
                var isMultiple = isMultiple === "true";

                //removedImageArray : array[object] which has the current removed object
                var rImage = removedImageArray[0];
                //not for local uploads
                if (rImage.islocalUpload) {
                    return;
                };
                var rImageUrl = rImage.localImageUrl;
                var rImageMeta = getStorageMeta(rImageUrl);


                //Title image removed
                if (!isMultiple) {
                    if ($scope.postdata.title_img_src == rImageUrl) {
                        $scope.postdata.title_img_src = null;
                        //using the meta remove this file from storage
                        fbase.deleteImageFromStorage($scope.postdata.titleImgStorageMeta);
                        $scope.postdata.titleImgStorageMeta = null;

                        // console.log($scope.postdata);
                        return;
                    }
                } // Title image removal

                //Gallery image removed

                //remove files from storage
                fbase.deleteImageFromStorage(rImageMeta.meta);


                //remove local state image objects
                //get index or returns -1
                var rImageIndex = $scope.postdata.gallery.indexOf(rImageUrl);
                if (rImageIndex >= 0) {
                    //remove the url from gallery array 
                    $scope.postdata.gallery.splice(rImageIndex, 1);
                }
                //now remove the metaobject

                //remove this object from  galleryFilesStorageMeta[Array]
                $scope.postdata.galleryFilesStorageMeta.splice(rImageMeta.index, 1);

                // console.log($scope.postdata);


            }


            //called after files are uploaded 
            this.updatesforcontroller = function (message) {
                    // message : [Array] of objects having uploaded meta of images
                    $scope.isBothUploadsReceivedCount += 1;
                    //title image received
                    if (message.length == 1 && !message[0].isMultiple) {
                        message = message[0];
                        title_img_src = message.url;
                        titleImgStorageMeta = message;

                        if ($scope.posttype == "editPost") {
                            //for edit feature
                            $scope.postdata.title_img_src = title_img_src;
                            $scope.postdata.titleImgStorageMeta = titleImgStorageMeta;
                        }
                        // console.log($scope.postdata)
                        return;
                    };

                    galleryFilesStorageMeta = message;
                    message.forEach(function (eachobj) {
                        gallery.push(eachobj.url);
                    });

                    if ($scope.posttype == "editPost") {

                        //After edit add new uploads to old uploads
                        gallery.forEach((g) => {

                            $scope.postdata.gallery.push(g);
                        });

                        galleryFilesStorageMeta.forEach((gm) => {

                            $scope.postdata.galleryFilesStorageMeta.push(gm);
                        })
                    }

                    // console.log($scope.postdata);
                } //updates received to this controller
        }, //end of controller function 

        templateUrl: "partials/post.html",
    } //return
} //post directive