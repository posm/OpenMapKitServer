#!/bin/bash

# --- tar-osm.sh ---
#
# This script looks in a directory recursively and finds all of the .osm files
# It then writes them all together into a tar.gz.
#
# Example Usage:
# ./tar-osm.sh ../data/submissions ~/tmp/osm.tar.gz
#
# The first argument is the input directory (probably your ODK submissions directory).
# The second argument is the path to the tar.gz you want created.

input_dir=$1
tar_gz=$2

# temporary dir to be copied to
tmp=$(mktemp -d)

mkdir -p $tmp/osm

# copy osm files to temp dir
copy() {
    cp $1 $tmp/osm/
}

# iterate through the osm files we found
for osm in $(find $input_dir -iname '*.osm')
do
	copy $osm
done

pushd $tmp
tar cvf $tar_gz .
popd

# clean up
rm -rf $tmp
