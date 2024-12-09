#!/bin/bash
#
#

echo "# compiling xsokoban90.1"
node sokoita_rulegen.js \
  -L ./xsokoban90.1.xsb \
  -T sokoita_tileset.png \
  -t ../img/sokoita_flat_tileset.png \
  -M sokoita_tiled.json \
  -m sokoita_flat_tiled.json \
  -w custom.1 \
  -z 64 \
  -s 16 \
  -P sokoita_poms_xsokoban90_1.json
echo "# xsokoban90.1 generated (sokoita_poms_xsokoban90_1.json)"

exit

echo "# compiling bakaban"
node sokoita_rulegen.js \
  -L ../data/bakaban.xsb \
  -T sokoita_tileset.png \
  -t ../img/sokoita_flat_tileset.png \
  -M bakaban_tiled.json \
  -m bakaban_flat_tiled.json \
  -w custom \
  -z 4 \
  -s 16 \
  -P sokoita_poms_bakaban.json
echo "# bakaban generated"

echo "# compiling validation0"
node sokoita_rulegen.js \
  -L ./validation0.xsb \
  -T sokoita_tileset.png \
  -t ../img/sokoita_flat_tileset.png \
  -M validation0_tiled.json \
  -m validation0_flat_tiled.json \
  -w custom \
  -z 32 \
  -s 16 \
  -P validation0_poms.json
echo "# validation0 generated (validation0_poms.json)"


echo "# compiling validation1"
node sokoita_rulegen.js \
  -L ./validation1.xsb \
  -T sokoita_tileset.png \
  -t ../img/sokoita_flat_tileset.png \
  -M validation1_tiled.json \
  -m validation1_flat_tiled.json \
  -w custom \
  -z 32 \
  -s 16 \
  -P validation1_poms.json
echo "# validation1 generated (validation1_poms.json)"


echo "# compiling xsokoban90.1"
node sokoita_rulegen.js \
  -L ./xsokoban90.1.xsb \
  -T sokoita_tileset.png \
  -t ../img/sokoita_flat_tileset.png \
  -M sokoita_tiled.json \
  -m sokoita_flat_tiled.json \
  -w custom \
  -z 64 \
  -s 16 \
  -P sokoita_poms_xsokoban90_1.json
echo "# xsokoban90.1 generated (sokoita_poms_xsokoban90_1.json)"

