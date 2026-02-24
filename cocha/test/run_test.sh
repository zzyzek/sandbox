#!/bin/bash

# note that points need to be in sorted order for out index checks to match below
#

for ifn in `ls ../data/*.cocha | grep -v '_2d' ` ; do

  bfn=`basename $ifn`
  a=`../cocha.js -s -O index -i $ifn | grep -v '#' | sha256sum | cut -f1 -d' '`
  b=`../n4cha3d.js $ifn | grep -v '#' | sha256sum | cut -f1 -d' '`

  echo -n "$bfn: "
  if [[ "$a" == "$b" ]] ; then
    echo 'pass'
  else
    echo FAIL
  fi
done
