#!/bin/bash

#g++ -O3 rng_spoif.cpp -o rng_spoif -lm
#g++ -g rng_spoif.cpp -o rng_spoif -lm

g++ -Wall -O3 rng_spoif_cli.cpp rng_spoif.cpp -o spoif -lm
