## API

#### See your ODK submissions:

    http://{{your_host_url}}/omk/odk/submissions/{{form}}.json

#### See your OSM submissions:

This is where you can see what OpenMapKit Android users submitted to 
OpenMapKit Server.

    http://{{your_host_url}}/omk/odk/submissions/{{form}}.osm

To filter your OSM submissions by user, do the following:

    http://{{your_host_url}}/omk/odk/submissions/{{form}}.osm?user={{osm_user}}

To filter by date:

    http://{{your_host_url}}/omk/odk/submissions/{{form}}.osm?submitTimeStart=2015-12-28

or

    http://{{your_host_url}}/omk/odk/submissions/{{form}}.osm?submitTimeStart=2015-12-28&submitTimeEnd=2015-12-30
    