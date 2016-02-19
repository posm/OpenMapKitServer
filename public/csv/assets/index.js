function getParam(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

// adapted from csvkit's recursive JSON flattening mechanism:
// https://github.com/onyxfish/csvkit/blob/61b9c208b7665c20e9a8e95ba6eee811d04705f0/csvkit/convert/js.py#L15-L34

// depends on jquery and jquery-csv (for now)

function parse_object(obj, path) {
    if (path == undefined)
        path = "";

    var type = $.type(obj);
    var scalar = (type == "number" || type == "string" || type == "boolean" || type == "null");

    if (type == "array" || type == "object") {
        var d = {};
        for (var i in obj) {

            var newD = parse_object(obj[i], path + i + "/");
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

    // ?
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

// todo: add graceful error handling
function jsonFrom(input) {
  var string = $.trim(input);
  if (!string) return;
  return JSON.parse(string);
}

var input;
var url;
var lastSaved;

function doJSON() {
    // just in case
    $(".drop").hide();

    // get input JSON, try to parse it
    var newInput = $(".json textarea").val();
    if (newInput == input) return;

    input = newInput;
    if (!input) {
        // wipe the rendered version too
        $(".json code").html("");
        return;
    }

    var json = jsonFrom(input);

    // if succeeded, prettify and highlight it
    // highlight shows when textarea loses focus
    if (json) {
        var pretty = JSON.stringify(json, undefined, 2);
        $(".json code").html(pretty);
        if (pretty.length < (50 * 1024))
            hljs.highlightBlock($(".json code").get(0));
    } else
        $(".json code").html("");


    // convert to CSV, make available
    doCSV(json);

    return true;
}

// show rendered JSON
function showJSON(rendered) {
    console.log("ordered to show JSON: " + rendered);
    if (rendered) {
        if ($(".json code").html()) {
            console.log("there's code to show, showing...");
            $(".json .rendered").show();
            $(".json .editing").hide();
        }
    } else {
        $(".json .rendered").hide();
        $(".json .editing").show().focus();
    }
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
        $(th).html(header[field])
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
}

function doCSV(json) {
    // 1) find the primary array to iterate over
    // 2) for each item in that array, recursively flatten it into a tabular object
    // 3) turn that tabular object into a CSV row using jquery-csv
    var inArray = arrayFrom(json);

    var outArray = [];
    for (var row in inArray)
        outArray[outArray.length] = parse_object(inArray[row]);

    $("span.rows.count").text("" + outArray.length);

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

// loads original pasted JSON from textarea, saves to anonymous gist
// rate-limiting means this could easily fail with a 403.
function saveJSON() {
    if (!input) return false;
    if (input == lastSaved) return false;

    // save a permalink to an anonymous gist
    var gist = {
        description: "test",
        public: false,
        files: {
            "source.json": {
                "content": input
            }
        }
    };

    // TODO: show spinner/msg while this happens

    console.log("Saving to an anonymous gist...");
    $.post(
        'https://api.github.com/gists',
        JSON.stringify(gist)
    ).done(function(data, status, xhr) {

        // take new Gist id, make permalink
        setPermalink(data.id);

        // mark what we last saved
        lastSaved = input;

        console.log("Remaining this hour: " + xhr.getResponseHeader("X-RateLimit-Remaining"));

    }).fail(function(xhr, status, errorThrown) {
        console.log(xhr);
        // TODO: gracefully handle rate limit errors
        // if (status == 403)

        // TODO: show when saving will be available
        // e.g. "try again in 5 minutes"
        // var reset = xhr.getResponseHeader("X-RateLimit-Reset");
        // var date = new Date();
        // date.setTime(parseInt(reset) * 1000);
        // use http://momentjs.com/ to say "in _ minutes"

    });

    return false;
}

// given a valid gist ID, set the permalink to use it
function setPermalink(id) {
    if (history && history.pushState)
        history.pushState({id: id}, null, "?id=" + id);

    // log("Permalink created! (Copy from the location bar.)")
}

// check query string for gist ID
function loadPermalink() {
    var id = getParam("id");
    if (!id) return;

    $.get('https://api.github.com/gists/' + id,
        function(data, status, xhr) {
            console.log("Remaining this hour: " + xhr.getResponseHeader("X-RateLimit-Remaining"));

            var input = data.files["source.json"].content;
            $(".json textarea").val(input);
            doJSON();
            showJSON(true);
        }
    ).fail(function(xhr, status, errorThrown) {
        console.log("Error fetching anonymous gist!");
        console.log(xhr);
        console.log(status);
        console.log(errorThrown);
    });
}

$(function() {

    $(".json textarea").blur(function() {showJSON(true);});
    $(".json pre").click(function() {showJSON(false)});
    $(".csv textarea").blur(function() {showCSV(true);})
    $(".csv .raw").click(function() {
        showCSV(false);
        $(".csv textarea").focus().select();
        return false;
    })

    // if there's no CSV to download, don't download anything
    $(".csv a.download").click(function() {
        return !!$(".csv textarea").val();
    });

    $(".save a").click(saveJSON);

    // transform the JSON whenever it's pasted/edited
    $(".json textarea")
        .on('paste', function() {
            // delay the showing so the paste is pasted by then
            setTimeout(function() {
                doJSON();
                $(".json textarea").blur();
            }, 1);
        })
        .keyup(doJSON); // harmless to repeat doJSON

    // go away
    $("body").click(function() {
        $(".drop").hide();
    });

    $(document)
        .on("dragenter", function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(".drop").show();
        })
        .on("dragover", function(e) {
            e.preventDefault();
            e.stopPropagation();
        })
        .on("dragend", function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(".drop").hide();
        })
        .on("drop", function(e) {
            $(".drop").hide();

            if (e.originalEvent.dataTransfer) {
                if (e.originalEvent.dataTransfer.files.length) {
                    e.preventDefault();
                    e.stopPropagation();

                    var reader = new FileReader();

                    reader.onload = function(ev) {
                        console.log(ev.target.result);
                        $(".json textarea").val(ev.target.result);

                        setTimeout(function() {
                            doJSON();
                            $(".json textarea").blur();
                        }, 1);
                    }

                    reader.readAsText(e.originalEvent.dataTransfer.files[0]);
                }
            }
        });

    // highlight CSV on click
    $(".csv textarea").click(function() {$(this).focus().select();});

    loadPermalink();
    OMK.fetch();
});
