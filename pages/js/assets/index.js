function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// adapted from csvkit's recursive JSON flattening mechanism:
// https://github.com/onyxfish/csvkit/blob/61b9c208b7665c20e9a8e95ba6eee811d04705f0/csvkit/convert/js.py#L15-L34
// depends on jquery and jquery-csv (for now)
function parseObject(obj, path) {
    if (path == undefined) {
        path = "";
    }

    var type = $.type(obj);
    var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

    if (type == "array" || type == "object") {
        var d = {};
        for (var i in obj) {
            var newD = parseObject(obj[i], path + i + "/");
            $.extend(d, newD);
        }
        return d;
    }
    else if (scalar) {
        var d = {};
        var endPath = path.substr(0, path.length-1);
        d[endPath] = obj;
        return d;
    }
    else return {};
}


// otherwise, just find the first one
function arrayFrom(json) {
    var queue = [], next = json;
    while (next !== undefined) {
        if ($.type(next) == "array")
            return next;
        if ($.type(next) == "object") {
          for (var key in next)
             queue.push(next[key]);
        }
        next = queue.shift();
    }
    // none found, consider the whole object a row
    return [json];
}

function showCSV(rendered) {
    if (rendered) {
        if ($(".csv table").html()) {
            $(".csv .rendered").show();
            $(".csv .editing").hide();
        }
    } else {
        $(".csv .rendered").hide();
        $(".csv .editing").show().focus();
    }
}

// takes an array of flat JSON objects, converts them to arrays
// renders them into a small table as an example
function renderCSV(objects) {
    var rows = $.csv.fromObjects(objects, {justArrays: true});
    if (rows.length < 1) return;

    // find CSV table
    var table = $(".csv table")[0];
    $(table).html("");


    // render header row
    var thead = document.createElement("thead");
    var tr = document.createElement("tr");
    var header = rows[0];
    for (field in header) {
        var th = document.createElement("th");
        $(th).html(header[field]);
        tr.appendChild(th);
    }
    thead.appendChild(tr);

    // render body of table
    var tbody = document.createElement("tbody");
    for (var i=1; i<rows.length; i++) {
        tr = document.createElement("tr");
        for (field in rows[i]) {
            var td = document.createElement("td");
            $(td)
                .html(rows[i][field])
                .attr("title", rows[i][field]);
            tr.appendChild(td);
        }
        tbody.appendChild(tr);
    }

    table.appendChild(thead);
    table.appendChild(tbody);

    //register the mdl Table
    setTimeout(function () {
        componentHandler.upgradeAllRegistered();
    }, 1000);
}

function doCSV(json) {
    // 1) find the primary array to iterate over
    // 2) for each item in that array, recursively flatten it into a tabular object
    // 3) turn that tabular object into a CSV row using jquery-csv
    var inArray = arrayFrom(json);

    var outArray = [];
    for (var row in inArray)
        outArray[outArray.length] = parseObject(inArray[row]);

    $("span.rows.count").text("" + outArray.length);

    var count = outArray.length;



    var csv = $.csv.fromObjects(outArray);
    // excerpt and render first 10 rows
    renderCSV(outArray);
    showCSV(true);

    // show raw data if people really want it
    $(".csv textarea").val(csv);

    // download link to entire CSV as data
    // thanks to http://jsfiddle.net/terryyounghk/KPEGU/
    // and http://stackoverflow.com/questions/14964035/how-to-export-javascript-array-info-to-csv-on-client-side
    var uri = "data:text/csv;charset=utf-8," + encodeURIComponent(csv);
    $(".csv a.download").attr("href", uri).attr("download", getParam('form') + ".csv");
    $("#downloadJson").attr("href", OMK.jsonUrl()).attr("download", getParam('form') + ".json");
}

$(function() {

    $(".areas").hide();
    $("#submissionPagespinner").show();

    $(".csv textarea").blur(function() {
        showCSV(true);
    }).click(function() {
        // highlight csv on click
        $(this).focus().select();
    });

    $(".csv .raw").click(function() {
        showCSV(false);
        $(".csv textarea").focus().select();
        return false;
    });

    // if there's no CSV to download, don't download anything
    $(".csv a.download").click(function() {
        return !!$(".csv textarea").val();
    });

    // go away
    $("body").click(function() {
        $(".drop").hide();
    });

    OMK.fetch();
});
