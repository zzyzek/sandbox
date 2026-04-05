#!/bin/bash

fn='bridges2026.gp'
fnjs='bridges2026.js'

node ./brdg.js > $fn

echo 'var bridges2026 = [' > $fnjs
grep -v '#' $fn | \
  sed 's/ /,/g' | \
  sed 's/^/[/' | \
  sed 's/$/],/' >> $fnjs
echo '];' >> $fnjs
echo 'var COLOR_IDX = [' >> $fnjs
grep idx $fn | \
  cut -f3 -d':' | \
  tr '\n' ',' | \
  sed 's/, *$//' >> $fnjs
echo '];' >> $fnjs


