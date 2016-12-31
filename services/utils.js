angular.module("isteAdmin")
.factory("utils", utils);

utils.$inject = ["$window"];
function utils($window) {
    return {
        getObjectUrls: getObjectUrls,
        revokeObjectUrl:revokeObjectUrl
    };

    function getObjectUrls(files) {
        var urls = [];

        if (files.length > 0) {
            files.forEach(function (file) {
                //return if server object
                console.log(file.islocalUpload)
                if(!file.islocalUpload){
                    return;
                }
                var url = $window.URL.createObjectURL(file);
                urls.push(url);
            });
        } //if
console.log(urls);
        return urls;
    };

    function revokeObjectUrl(url){
        $window.URL.revokeObjectURL(url);
    }
};