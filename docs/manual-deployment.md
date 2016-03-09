## Manual Deployments

For a given deployment, give it a short name folder like:

```
/opt/omk/OpenMapKitServer/data/deployments/liberia
```

Create a `manifest.json` file to describe your deployment. You don't
need all the nitty-gritty details to make it work--just the `name`
and `title`. Here is an example `manifest.json`:

```json
{
  "title": "Liberia Maiden Voyage",
  "name": "liberia",
}

```

Manifests from POSM are much more detailed, but this is all you need
for OpenMapKit Server to serve deployments to OpenMapKit Android.

Place the `manifest.json` in the deployment directory:

```
/opt/omk/OpenMapKitServer/data/deployments/liberia/manifest.json
```

Place all of the MBTiles and OSM XML files in your deployment directory
like so:

```
/opt/omk/OpenMapKitServer/data/deployments/liberia/some-mbtile.mbtiles
/opt/omk/OpenMapKitServer/data/deployments/liberia/some-osm.osm
```

The part that matters is the extension. The files have to end in `.mbtiles`
or `.osm`.

With this, you should be good to go to download a deployment on your phone!
