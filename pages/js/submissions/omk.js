window.OMK = {};

OMK.fetch = function (cb) {
    OMK.fetchJSON(OMK.jsonUrl(), cb);
};

OMK.jsonUrl = function () {
    var json = getParam('json');
    if (!json) {
        var form = getParam('form');
        if (form) {
            $('h1').html(capitalizeFirstLetter(form.replace(/_/g,' ')));
            json = OMK.omkServerUrl() + '/omk/odk/submissions/' + form + '.json';
        }
    }
    return json;
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

/**
 * Determines the OMK Server endpoint.
 *
 * @returns {*}
 */
OMK.omkServerUrl = function () {
    var omkServer = getParam('omk_server');
    return (omkServer ? omkServer : window.location.origin);
};

OMK.getFormMetaData = function () {
    var formId = getParam('form');

    $.get('/formList?json=true&formid=' + formId, function(data, status, xhr) {
        // get title and total submissions
        var title = data.xforms.xform[0].name;
        $("h2.rows.count").text(title + " (" + data.xforms.xform[0].totalSubmissions + ")");

        $("#submissionPagespinner").hide();
        $(".areas").show();
        $(".csv").show();
        $("#submissionCard").show();

    }).fail(function(xhr, status, errorThrown) {
        var form = getParam('form');
        console.log("Error fetching ODK submissions!");
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

}
