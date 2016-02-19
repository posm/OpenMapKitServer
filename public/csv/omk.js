window.OMK = {};

OMK.fetch = function () {
    OMK.fetchJSON(getParam('json'));

    var form = getParam('form');
    if (form) {
        var url = OMK.omkServerUrl() + '/submissions/' + form + '.json';
        OMK.fetchJSON(url);
    }

};

OMK.fetchJSON = function (url) {
    if (!url) return;

    $.get(url, function(data, status, xhr) {
        doCSV(data);
    }).fail(function(xhr, status, errorThrown) {
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
