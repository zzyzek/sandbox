#!/bin/bash
#
#


echo "# compiling bakaban"

node sokoita_rulegen.js \
  -L ../data/bakaban.xsb \
  -T sokoita_tileset.png \
  -t ../img/sokoita_flat_tileset.png \
  -M bakaban_tiled.json \
  -m bakaban_flat_tiled.json \
  -z 4 \
  -s 16 \
  -P sokoita_poms_bakaban.json

echo "# bakaban generated"

exit

node sokoita_rulegen.js \
  -L ./xsokoban90.1.xsb \
  -T sokoita_tileset.png \
  -t ../img/sokoita_flat_tileset.png \
  -M sokoita_tiled.json \
  -m sokoita_flat_tiled.json \
  -z 64 \
  -s 16 \
  -P sokoita_poms_xsokoban90_1.json
