#!/bin/bash

gcc -O3 plugdp_fast_cli.c plugdp_fast.c -o plugdp_fast
gcc -O3 plugdp.c -DPLUGDP_TEST_MAIN -o plugdp
