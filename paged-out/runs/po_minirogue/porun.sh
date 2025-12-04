#!/bin/bash


N='32,32,1'
Q="$N"
B='8:32'

poms \
  -s $N \
  -q $Q \
  -C ./data/minirogue_poms.json \
  -b 1 -B $B \
  -w 1.5 -E -1.75 \
  -S 1337 \
  -P min \
  -O patch-policy=pending \
  -V 2 \
  -1 ./po_mr.json
