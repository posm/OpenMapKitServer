window.OMK = {};

OMK.fetch = function () {
    OMK.fetchJSON(OMK.jsonUrl());
};

OMK.jsonUrl = function () {
    var json = getParam('json');
    if (!json) {
        var form = getParam('form');
        if (form) {
            $('h1').html(form);
            json = OMK.omkServerUrl() + '/submissions/' + form + '.json';
        }
    }
    return json;
};

OMK.fetchJSON = function (url) {
    if (!url) return;

    $.get(url, function(data, status, xhr) {
        $('.fetching').hide();
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
