#!/bin/bash


n0=10
N1=100000
sn=10

M=1000

n=$n0

dim=2

spoif="../spoif"

every=100

while [[ $n -le $N1 ]] ; do
  echo "# n:$n"

  for seed in `seq $M` ; do
    #echo $n $it

    c=`echo "$seed % $every" | bc`
    if [[ $c -eq 0 ]] ; then
      echo "# n:$n, $seed / $M passed"
    fi


    sha0=` $spoif -n $n -d $dim -S $seed | sha256sum | cut -f1 -d ' ' `
    sha1=` $spoif -n $n -d $dim -S $seed -A naive | sha256sum | cut -f1 -d ' ' `

    if [[ "$sha0" != "$sha1" ]] ; then
      echo "FAIL! n:$n dim:$dim seed:$seed ($sha0 != $sha1)"
      exit -1
    fi

  done

  n=`echo "$n * $sn" | bc`
done




