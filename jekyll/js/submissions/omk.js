window.OMK = {};

OMK._paginationOffset = 0;
OMK._PAGINATION_LIMIT = 5000;

OMK.fetch = function (cb) {
    OMK.getFormMetaData(function(metadata) {
        OMK.fetchJSON(OMK.jsonUrl() + '?offset=0&limit=' + OMK._PAGINATION_LIMIT, function() {
            cb();
            // pagination too slow
            // OMK.paginate(metadata.total);

            if (OMK._PAGINATION_LIMIT < metadata.total) {
                var toastOptions = {
                    style: {
                        main: {
                            background: "#f2dede",
                            color: "#a94442",
                            'box-shadow': '0 0 0px'
                        }
                    }
                };
                iqwerty.toast.Toast('The data set is large. We have loaded ' + OMK._PAGINATION_LIMIT +
                    ' of ' + metadata.total + ' submissions. Download the ODK CSV or JSON data to get the rest.', toastOptions);
            }
        });
    });
};

OMK.jsonUrl = function () {
    var json = getParam('json');
    if (!json) {
        var form = getParam('form');
        if (form) {
            json = OMK.omkServerUrl() + '/omk/odk/submissions/' + form + '.json';
        }
    }
    return json;
};

OMK.csvUrl = function () {
    var form = getParam('form');
    return OMK.omkServerUrl() + '/omk/odk/submissions/' + form + '.csv';
};

//Function to capitalise first character for strings
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

OMK.fetchJSON = function (url,cb) {
    if (!url) return;

    $.get(url, function(data, status, xhr) {
        doCSV(data);
        if(cb) cb()
    }).fail(function(xhr, status, errorThrown) {
        var form = getParam('form');
        $("#submissionPagespinner").hide();
        $("#alert").text("No data has been submitted for " + form + '.');
        console.log("Error fetching ODK submissions!");
        console.log(xhr);
        console.log(status);
        console.log(errorThrown);
    });
};

OMK.jsonPaginationUrl = function() {
    return OMK.jsonUrl() + '?offset=' + OMK._paginationOffset + '&limit=' + OMK._PAGINATION_LIMIT;
};

/**
 * Doing recursive loads of pagination of data is quite slow and halts the UI.
 * We're going to disable this for now...
 *
 * @param total
 */
OMK.paginate = function (total) {
    setTimeout(function() { // timeouts dont completely fix the UI from halting...
        OMK._paginationOffset += OMK._PAGINATION_LIMIT;
        if (OMK._paginationOffset < total) {
            $.get(OMK.jsonPaginationUrl(), function (data, status, xhr) {
                OMK.addPaginationData(data);
                OMK.paginate(total);
            });
        }
    }, 1000);
};

OMK.addPaginationData = function (data) {
    var flatObjects = createFlatObjects(data);
    var rows = $.csv.fromObjects(flatObjects, {justArrays: true});
    for (var i = 1, len = rows.length; i < len; i++) {
        var row = rows[i];
        OMK._dataTable.row.add(row).draw(false);
    }
};

/**
 * Determines the OMK Server endpoint.
 *
 * @returns {*}
 */
OMK.omkServerUrl = function () {
    var omkServer = getParam('omk_server');
    return (omkServer ? omkServer : window.location.origin);
};

OMK.getFormMetaData = function (cb) {
    var formId = getParam('form');

    $.get('/formList?json=true&formid=' + formId, function(data, status, xhr) {
        // get title and total submissions
        var title = data.xforms.xform[0].name;
        var total = data.xforms.xform[0].totalSubmissions;
        $("h2.rows.count").text(title + " (" + total + ")");
        cb({
            title: title,
            total: total
        });

    }).fail(function(xhr, status, errorThrown) {
        var form = getParam('form');
        console.log("Error fetching ODK form metadata!");
        console.log(xhr);
        console.log(status);
        console.log(errorThrown);
    });
};

OMK.submitChangeset = function () {
    var formId = getParam('form');

    $.get('/omk/odk/submit-changesets/' + formId, function(data, status, xhr) {
        // snackbar
        var notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar(
            {
                message: data.msg
            }
        );
    }).fail(function(xhr, status, errorThrown) {
        // snackbar
    });

};

OMK.downloadOSM = function (url, element) {
    $.get(url, function(data, status, xhr) {

    }).fail(function(xhr, status, errorThrown) {
        // notify user if download fails
        var notification = document.querySelector('.mdl-js-snackbar');
        notification.MaterialSnackbar.showSnackbar(
            {
                message: xhr.responseJSON.msg
            }
        )
    });
};

