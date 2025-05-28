#!/bin/bash

idir=data_9_14
ofn="mean_9_14.gp"

H=178

for fn in `ls -v ${idir}/*.gp ` ; do
  echo -n $H ''
  cut -f3 -d' ' $fn | datamash mean 1
  H=`echo ${H}+1 | bc`
done > $ofn

