#!/bin/bash
#
#

echo "# compiling noreturn microban.6"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/microban.6.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M microban_6_nr_tiled.json \
  -m microban_6_nr_flat_tiled.json \
  -w custom \
  -z 115 \
  -s 16 \
  -P microban_6_nr.poms
echo "# microban.6 noreturn generated (microban_6_nr.poms)"

exit

echo "# compiling noreturn microban.5"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/microban.5.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M microban_5_nr_tiled.json \
  -m microban_5_nr_flat_tiled.json \
  -w custom \
  -z 30 \
  -s 16 \
  -P microban_5_nr.poms
echo "# microban.5 noreturn generated (microban_5_nr.poms)"

exit

echo "# compiling noreturn microban.4"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/microban.4.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M microban_4_nr_tiled.json \
  -m microban_4_nr_flat_tiled.json \
  -w custom \
  -z 28 \
  -s 16 \
  -P microban_4_nr.poms
echo "# microban.4 noreturn generated (microban_4_nr.poms)"

exit

echo "# compiling noreturn microban.3"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/microban.3.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M microban_3_nr_tiled.json \
  -m microban_3_nr_flat_tiled.json \
  -w custom \
  -z 45 \
  -s 16 \
  -P microban_3_nr.poms
echo "# microban.3 noreturn generated (microban_3_nr.poms)"

exit

echo "# compiling noreturn microban.2"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/microban.2.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M microban_2_nr_tiled.json \
  -m microban_2_nr_flat_tiled.json \
  -w custom \
  -z 20 \
  -s 16 \
  -P microban_2_nr.poms
echo "# microban.2 noreturn generated (microban_2_nr.poms)"

exit

echo "# compiling noreturn microban.1"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/microban.1.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M microban_1_nr_tiled.json \
  -m microban_1_nr_flat_tiled.json \
  -w custom \
  -z 34 \
  -s 16 \
  -P microban_1_nr.poms
echo "# microban.1 noreturn generated (microban_1_nr.json)"

exit

echo "# compiling noreturn xsokoban90.1"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ./xsokoban90.1.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M xsokoban90_1_nr_tiled.json \
  -m xsokoban90_1_nr_flat_tiled.json \
  -w custom \
  -z 64 \
  -s 16 \
  -P xsokoban90_1_nr.json
echo "# xsokoban90.1 noreturn generated (xsokoban90_1_nr.json)"

exit

echo "# compiling validation0"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/validation0.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M validation0_nr_tiled.json \
  -m validation0_nr_flat_tiled.json \
  -w custom \
  -z 22 \
  -s 16 \
  -P validation0_nr.json \
  -V 1
echo "# validation0 generated (validation0_nr.json)"

exit

echo "# compiling validation1"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/validation1.xsb \
  -T sokoita_tileset_nr.png \
  -t ../img/sokoita_flat_tileset_noreturn.png \
  -M validation1_nr_tiled.json \
  -m validation1_nr_flat_tiled.json \
  -w custom \
  -z 32 \
  -s 16 \
  -P validation1_nr.json
echo "# validation1 generated (validation1_nr.json)"

exit

echo "# compiling noreturn bakaban"
node --max-old-space-size=16384 \
  sokoita_rulegen_noreturn.js \
  -L ../data/validation/bakaban.0.xsb \
  -T sokoita_tileset_nr.png \
  -t ../data/tileset/sokoita_linear_noreturn.png \
  -M bakaban_tiled_nr.json \
  -m bakaban_flat_tiled_nr.json \
  -w custom \
  -z 4 \
  -s 16 \
  -P bakaban_nr.0.json
echo "# bakaban noreturn generated (bakaban_nr.0.json)"

exit


### not updated vvvvv
###             vvvvv
###

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

