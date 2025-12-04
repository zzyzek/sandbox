#!/bin/bash

poms \
  -C ./po1985_poms.json \
  -b 1 -B 16:32 \
  -w 4 -E -1.5 \
  -P 'min' \
  -S 1337 \
  -V 2 \
  -1 ./po_1985.json
