#!/bin/bash

url='https://webdocs.cs.ualberta.ca/~games/Sokoban/Mazes/Screens/'

N=90

for i in `seq $N` ; do
  fn="screen.${i}.jpg"
  wget "$url/$fn"
done
