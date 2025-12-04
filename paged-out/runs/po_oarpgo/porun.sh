#!/bin/bash



N="32,32,1"
Q=$N

B='12:24'

opt="wUbW3x3"
logfn="oarpgo_${opt}.log"

ppolicy="cone-"

echo "# oarpgo $opt"
echo "# Q: $Q"
echo "# N: $N"
echo "# patch policy: $ppolicy"
echo "# snapshot: data/oarpgo_snapshot_${opt}.json"
echo "# log: $logfn"
echo "# tiled output: data/oarpgo_${w}x${h}_${opt}.json"

poms \
  -s $N \
  -q $Q \
  -C ./data/oarpgo_poms_${opt}.json \
  -b 1 -B $B \
  -P min \
  -O "patch-policy=$ppolicy" \
  -w 1.5 -E -1.75 \
  -S 1337 \
  -V 1 \
  -1 ./po_oarpgo.json
