angular.module("isteAdmin")
    .directive("handleFiles", handleFiles)
    .directive("customload", customload);


handleFiles.$inject = ["utils", "fbase", "$window"];

function handleFiles(utils, fbase, $window) {
    return {
        require: "^post",
        restrict: "EA",
        replace: true,
        scope: {
            validuploadsize: "@",
            isMultiple: "@multiple",
            posttype: "=",
            prefilleddata: "=" //use only if posttype=="editPost"
        },
        templateUrl: "partials/images.html",
        link: function ($scope, ele, attrs, postController) {
                // globals
                // console.log($scope.posttype);
                $scope.isEditPost = $scope.posttype === 'editPost';
                //get value if user provides a limit
                //defaults to 3 MB
                var validUploadSize = $scope.validuploadsize || 3;
                // ismultiple  defaults to true
                if ($scope.isMultiple === undefined) {
                    $scope.isMultiple = "true";
                }
                //uploads counter
                $scope.uploadsCounter = 0;
                //will be filled by fileObjects selected by user [for multiple files]
                var files = [];
                //reference to element with file input
                var fileElementRef;
                //populate file if edit mode

                function populateFilesOnEditModeFromServer(post) {
                    //post [obj]:server returned object of a post
                    if (post.gallery == undefined) {
                        post.gallery = [];
                    }
                    if (post.galleryFilesStorageMeta == undefined) {
                        post.galleryFilesStorageMeta = [];
                    }

                    if ($scope.isMultiple != "true") {
                        // single file
                        var tempServerSingleObj = {};
                        tempServerSingleObj.islocalUpload = false;
                        tempServerSingleObj.isImage = true;
                        tempServerSingleObj.localImageUrl = post.title_img_src;
                        tempServerSingleObj.serverMetaOfImage = post.titleImgStorageMeta;

                        files.push(tempServerSingleObj);
                    } else {
                        //multiple files
                        for (var i = 0; i < post.gallery.length; i++) {
                            var tempServerMultipleObj = {};
                            var eachpostobj = post.galleryFilesStorageMeta[i];
                            tempServerMultipleObj.islocalUpload = false;
                            tempServerMultipleObj.isImage = true;
                            tempServerMultipleObj.localImageUrl = eachpostobj.url;
                            tempServerMultipleObj.serverMetaOfImage = eachpostobj;
                            files.push(tempServerMultipleObj);
                        } //for
                    } //if/else
                    //now we can update $scope i think!
                    $scope.files = files;
                    // console.log(files);
                } //populateFilesOnEditModeFromServer
                if ($scope.posttype == "editPost") {
                    populateFilesOnEditModeFromServer($scope.prefilleddata);
                }

                function populateFilesFromUserComputer(fileList, isMultiple) {
                    //reset if not multiple files
                    if ($scope.isMultiple != "true") {
                        // console.log("wtf");
                        files = [];
                    }
                    var noOfFiles = fileList.length;
                    for (var i = 0; i < noOfFiles; i++) {
                        //check for valid file
                        var tempfile = fileList[i];
                        //defaults
                        tempfile.isImage = true;

                        //validations
                        var isImage = tempfile.type.split("/")[0] == "image";
                        var isValidSize = (tempfile.size / (1024 * 1024)) <= validUploadSize;
                        if (!isImage) {
                            tempfile.isImage = false;
                            alert("Select only Images");

                        }
                        if (!isValidSize) {
                            alert("Image (" + tempfile.name + ") is over " + validUploadSize + " Mb, Try optimising it and upload.");

                        }
                        //push file after all the validations are done


                        //add a tag that this file was from user computer and not from server
                        tempfile.islocalUpload = true;

                        if (isImage && isValidSize) {
                            files.push(tempfile);
                        };
                    } //for
                } //populateFilesFromUserComputer end

                function attachUrlsToFileObjects(urls) {
                    //workaround for server + localimage uploads localImageUrl generation
                    var localcount = 0;
                    for (var i = 0; i < files.length; i++) {

                        if (!files[i].islocalUpload) {
                            localcount++;
                            continue;
                        }
                        files[i]["localImageUrl"] = urls[i - localcount];
                    }

                    // console.log(files);
                }


                //handles files added through input[type=file] element
                var inputFilesHandlerListener = function (e) {
                    console.log(e.target);
                    e.preventDefault();
                    e.stopPropagation();

                    fileElementRef = e.target;
                    var fileList = e.target.files;

                    //before handling file check to see if there is any server received image already rendered
                    if ($scope.posttype == "editPost" && $scope.isMultiple != "true") {
                        //now we may have already rendered post
                        //check files object, if its not local
                        if (files.length >= 1) {
                            // console.log(files[0].islocalUpload);
                            if (!files[0].islocalUpload) {
                                //alert file will be removed permanently from server
                                //todo: firebase:storage -> remove the file in storage
                                alert("The current file will be deleted as Title pic");

                            } else {
                                // console.log("wtf");
                            }
                        } //length
                    } //editPost
                    populateFilesFromUserComputer(fileList);
                    handleFiles(files);

                }; //inputFilesHandlerListener

                //if multiple files we use Drag & drop
                //Add support for input[type=file multiple=true] for mobile support
                if ($scope.isMultiple == "true") {
                    // drag & drop events
                    ele.bind("dragenter", dragenter);
                    ele.bind("dragover", dragover);
                    ele.bind("drop", drop);

                    //mobile support for input element
                    var insidediv = angular.element(ele[0]);
                    insidediv.bind("change", inputFilesHandlerListener);

                    function dragenter(e) {
                        e.stopPropagation();
                        e.preventDefault();
                    }

                    function dragover(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        ele.children().addClass("dropbox-expand");
                    }

                    function drop(e) {
                        e.stopPropagation();
                        e.preventDefault();
                        var dt = e.dataTransfer;
                        fileList = dt.files;
                        populateFilesFromUserComputer(fileList);
                        handleFiles(files);
                    } //drop
                } else {
                    // for single files we use just input element
                    var insidediv = angular.element(ele[0]);
                    insidediv.bind('change', inputFilesHandlerListener);

                } //if/else {ismultiple} option

                function handleFiles(files) {
                    //for temporary display
                    var urls = utils.getObjectUrls(files);
                    //attach urls to fileObjects
                    attachUrlsToFileObjects(urls);
                    //  update $scope
                    $scope.$apply(function () {
                        $scope.files = files;
                        // console.log(files);
                    });
                }; //handleFiles

                // removes a selected image
                $scope.removeSelection = function (index) {
                        //remove the file from selection, if server file also clear from server
                        var slicedfile = files.splice(index, 1);
                        //tell post controller to remove this particular image from its state
                        postController.removeImage(slicedfile, $scope.isMultiple);
                        //for single files
                        if ($scope.isMultiple == 'false') {
                            //also clear the file from input[type=file] element 
                            if (fileElementRef) {
                                fileElementRef.value = "";
                            }
                        }
                    } //removeSelection
                    //upload to firebase
                function toUploadFilesCount() {
                    var count = 0;
                    files.forEach(function (file) {
                        // count only local images
                        if (file.islocalUpload) {
                            count++;
                        }
                    });
                    return count;
                }

                $scope.uploadToFirebase = function (hey) {
                        //stores the fb->storage returned metadata of uploaded file
                        var uploadedfiles = [];
                        if (files.length == 0) {
                            return;
                        }
                        // prevent multiple uploads if once done
                        $scope.uploadOnceDone = true;
                        files.forEach(function (file) {
                            //service function to upload file to storage
                            //upload only localUploaded files to storage [not files already retreived from server]
                            if (!file.islocalUpload) {
                                return;
                            }
                            fbase.uploadImages(file).then(function (metadata) {
                                // increment counter to update ui
                                $scope.uploadsCounter += 1;
                                //send if this is multiple files or not
                                var isMultiple = $scope.isMultiple === 'true';
                                uploadedfiles.push({
                                    fullPath: metadata.fullPath,
                                    isMultiple: isMultiple,
                                    name: metadata.name,
                                    url: metadata.downloadURLs[0]
                                });
                                //check if all files are uploaded or not
                                // console.log(toUploadFilesCount(),"function")
                                // console.log($scope.uploadsCounter,"counter");
                                if ($scope.uploadsCounter === toUploadFilesCount()) {
                                    //notify the parent controller only after all files are done uploading
                                    postController.updatesforcontroller(uploadedfiles);
                                } //if
                                // update the ui of image,to show its uploaded
                                updateImageUi(metadata.customMetadata.localImageUrl);
                            }).catch(function (err) {
                                //upload of a file failed
                                console.error(err);
                            });
                        });
                    } //uploadToFirebase

                // updates the ui to show an image is uploaded
                function updateImageUi(localurl) {
                    // localurl : url 
                    //loop over files and find the matching file
                    files.forEach(function (eachfile) {
                        if (eachfile.localImageUrl == localurl) {
                            // this file is uploaded
                            eachfile.isUploaded = true;
                        }
                    });
                } //updateImageUi
            } //link function end

    } //return
}; //handleFiles



// this directive frees the memory created for a image once image is loaded by the browser
customload.$inject = ["utils"];

function customload(utils) {
    return {
        restrict: "A",
        link: function ($scope, ele, attrs) {
                //get image element
                ele = angular.element(ele[0]);
                ele.bind("load", function (e) {
                    // console.log(e.target.src);
                    utils.revokeObjectUrl(e.target.src);
                });
            } ///link
    }; //return
};