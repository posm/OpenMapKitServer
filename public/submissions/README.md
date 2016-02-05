# Submissions

This is the directory that ODK Collect sends form submissions.
The ODX XForm XML and JSON as well as the JSOM OSM XML edits
go here.

## Structure

* submissions
    - form name
        * form UUID (a single submission)
            - data.xml (XForm instance)
            - data.json (XForm JSON equivalent)
            - *.osm (JOSM OSM XML)
        * finalized-osm-checksums.txt (blacklist of SHA1 checksums of submitted OSM XML files)
        