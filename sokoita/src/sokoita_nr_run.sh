#!/bin/bash

RUN_NAME=bakaban
RUN_NAME=validation1
RUN_NAME=validation0
RUN_NAME=xsokoban90_1
RUN_NAME=microban_1
RUN_NAME=microban_2
RUN_NAME=microban_3
RUN_NAME=microban_4
RUN_NAME=microban_5
RUN_NAME=microban_6

pomsbin="./poms.sokoita"
pomsbindebug="./poms.sokoita.debug"

v0soft="6,6,22"
#v0soft="5,5,10"

if [[ "$RUN_NAME" == "bakaban" ]] ; then
  $pomsbin -C ./bakaban_nr.0.json \
    -b 1 -B 2 \
    -w 1 -E -1.75 \
    -P min -J 1000000 \
    -3 fin_bakaban_nr_tiled.json \
    -5 bakaban_nr_snapshot.json \
    -V 1
elif [[ "$RUN_NAME" == "validation0" ]] ; then

  $pomsbin -C ./validation0_nr.json \
    -b 1 -B "$v0soft" \
    -w 1 -E -1.75 \
    -P min -J 1000000 \
    -3 fin_validation0_nr_tiled.json \
    -O exploded-tiled-snapshot-file="validation0_nr_snapshot.json" \
    -V 2

#  $pomsbin -C ./validation0_nr.json \
#    -b 1 -B "$v0soft" \
#    -w 1 -E -1.75 \
#    -P min -J 1000000 \
#    -3 fin_validation0_nr_tiled.json \
#    -5 validation0_nr_snapshot.json \
#    -V 2

elif [[ "$RUN_NAME" == "validation1" ]] ; then
  $pomsbin -C ./validation1_nr.json \
    -b 1 -B 2 \
    -w 1 -E -1.75 \
    -P min -J 1000000 \
    -3 fin_validation1_nr_tiled.json \
    -5 validation1_nr_snapshot.json \
    -V 1
elif [[ "$RUN_NAME" == "xsokoban90_1" ]] ; then

  $pomsbin -C xsokoban90_1_nr.json \
    -b 1 -B 5,5,22 \
    -w 1 -E -1.5 \
    -P min -J 1000000 \
    -3 sol_xsokoban90_1_nr_tiled.json \
    -5 xsokoban90_1_nr_snapshot.json \
    -O viz_step=10 \
    -V 2

elif [[ "$RUN_NAME" == "microban_1" ]] ; then

  $pomsbin -C microban_1_nr.poms \
    -b 1 -B 5,5,12 \
    -w 2 -E -1.25 \
    -P min -J 10000000 \
    -3 sol_microban_1_nr_tiled.json \
    -5 microban_1_nr_snapshot.json \
    -O viz_step=10 \
    -V 3

    #-O exploded-tiled-snapshot-file="microban_1_nr_exploded_snapshot.json" \
    #-5 microban_1_nr_snapshot.json \

elif [[ "$RUN_NAME" == "microban_2" ]] ; then

  $pomsbin -C microban_2_nr.poms \
    -b 1 -B 3,3,8 \
    -w 2 -E -1.25 \
    -P min -J 10000000 \
    -3 sol_microban_2_nr_tiled.json \
    -5 microban_2_nr_snapshot.json \
    -O viz_step=10 \
    -V 3

    #-O exploded-tiled-snapshot-file="microban_2_nr_exploded_snapshot.json" \
    #-5 microban_2_nr_snapshot.json \

elif [[ "$RUN_NAME" == "microban_3" ]] ; then

  $pomsbin -C microban_3_nr.poms \
    -b 1 -B 4,4,12 \
    -w 2 -E -1.25 \
    -P min -J 10000000 \
    -3 sol_microban_3_nr_tiled.json \
    -5 microban_3_nr_snapshot.json \
    -O viz_step=10 \
    -V 3

elif [[ "$RUN_NAME" == "microban_4" ]] ; then

  $pomsbin -C microban_4_nr.poms \
    -b 1 -B 3,3,8 \
    -w 2 -E -1.25 \
    -P min -J 10000000 \
    -3 sol_microban_4_nr_tiled.json \
    -5 microban_4_nr_snapshot.json \
    -O viz_step=10 \
    -V 3

elif [[ "$RUN_NAME" == "microban_5" ]] ; then

  $pomsbin -C microban_5_nr.poms \
    -b 1 -B 3,3,8 \
    -w 2 -E -1.25 \
    -P min -J 10000000 \
    -3 sol_microban_5_nr_tiled.json \
    -5 microban_5_nr_snapshot.json \
    -O viz_step=10 \
    -V 3

elif [[ "$RUN_NAME" == "microban_6" ]] ; then

  $pomsbin -C microban_6_nr.poms \
    -b 1 -B 3,3,8 \
    -w 2 -E -1.25 \
    -P min -J 10000000 \
    -3 sol_microban_6_nr_tiled.json \
    -5 microban_6_nr_snapshot.json \
    -O viz_step=10 \
    -V 3

fi

