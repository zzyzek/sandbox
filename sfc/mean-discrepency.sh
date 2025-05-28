#!/bin/bash

#idir=data_9_14
#ofn="mean_9_14.gp"

idir=$1
ofn=$2

if [[ "$idir" == "" ]] ; then
  echo "provide input directory"
  exit -1
fi

if [[ "$ofn" == "" ]] ; then
  ofn=/dev/stdout
fi

for fn in `ls -v ${idir}/*.gp ` ; do
  H=`basename $fn | cut -f2 -d_ | cut -f2 -dh`
  echo -n $H ''
  cut -f3 -d' ' $fn | datamash mean 1
  #H=`echo ${H}+1 | bc`
done > $ofn

