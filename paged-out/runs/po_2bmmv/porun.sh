#!/bin/bash

# notes:
# * for block size 32:
#   - doesn't converge as quickly (but doesn converge as far as I can tell)
#   - has initial ac4 failure
#   - also runs into BMS iteration counts (which I've further reduced with
#     the J option to help speed things along) which triggers erosion
#  * for block size 48:
#   - looks to converge much quicker
#

N='32,32,1'
Q="$N"
B='8:24'

#J=`echo '32*32*2' | bc`

poms \
  -s $N \
  -q $Q \
  -C ./data/2bmmv_poms.json \
  -b 1 -B $B \
  -w 4 -E -1.5 \
  -P 'min' \
  -O patch-policy=pending \
  -S 1337 \
  -V 2 \
  -1 ./po_2bmmv.json


