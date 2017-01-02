function ancCtrl(fbase) {
    ancctrl = this;

    ancctrl.allannouncements = null;
    ancctrl.selectedannouncements = [];
    var selectedCount;

    ancctrl.formfields = {
        announcement: "",
        link: "",
        selected: false
    }

    function clearForm() {
        ancctrl.formfields = {
            announcement: "",
            link: ""
        }
    };

    ancctrl.uploadAnc = function (e) {
            fbase.postAnnouncement(ancctrl.formfields).then(function () {
                    alert("upload success");
                    //clear the form
                    clearForm();
                })
                .catch(function (err) {
                    console.error(err);
                });
        } //uploadAnc
        //
    fbase.getAnnouncements().then(function (data) {
        console.log(data);
        ancctrl.allannouncements = data;
        manageActiveAnnc(data);
    }).catch((err) => {
        console.log(err);
    });

    //initial active selection
    function manageActiveAnnc(data) {
        var maxActive = 3;
        selectedCount = 0;
        var keys = Object.keys(data);
        keys.forEach(function (key) {
                var ann = data[key];
                ann.hash = key;

                if (ann.selected === true) {
                    if (selectedCount < maxActive) {
                        ancctrl.selectedannouncements.push(ann);
                        selectedCount++
                    } else {
                        //count exceeded so remove selection
                        ancctrl.removeAnnouncement(ann);
                    }
                } //if selected true
            }) //.keys


        //if count ===0 means our people didnt select any shit 
        //so notify them or by default select the latest added one
        if (selectedCount == 0) {
            var latestAnn = data[keys[keys.length - 1]];
            ancctrl.selectedannouncements.push(latestAnn);
            //select this one
            ancctrl.selectAnnouncement(latestAnn);
        }

    } //manageActive

    //listen to changes
    fbase.selectedActiveUpdates().on("child_changed", function (snap) {
        fbase.getAnnouncements().then(function (data) {
            ancctrl.allannouncements = data;
            //reset selected 
            ancctrl.selectedannouncements = [];
            //now manage again
            manageActiveAnnc(data);

        }).catch((err) => {
            console.log(err);
        });
    });
    ancctrl.selectAnnouncement = function (anc) {
            // console.log(anc);
            fbase.updateAnnouncement(anc.hashid, true);
        } //selectAnnouncement

    ancctrl.removeAnnouncement = function (anc) {
        // console.log(anc);
        fbase.updateAnnouncement(anc.hashid, false);
    }


} //controller function

//controller config object
var ancObj = {
    replace: true,
    controller: ancCtrl,
    templateUrl: "components/announcement.html"
}

//this will be a routeComponent at [#/announcement]
angular.module("isteAdmin")
    .component("announcement", ancObj)
    .config(function ($routeProvider) {

        //add our component to this route
        $routeProvider
            .when("/announcements", {
                template: "<announcement></announcement>",
                activetab: "announcements"
            })

    }); //config