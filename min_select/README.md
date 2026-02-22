Selection Algorithm
===

([wiki](https://en.wikipedia.org/wiki/Selection_algorithm))

$O(n)$ algorithm to find $k$'th order statistic of an unsorted
array, altering the array in place.

C
---

```
#include <stdio.h>
#include <stdlib.h>
#include "min_select.c"
int main(int argc, char **argv) {
  int a[] = { 11,9,6,10,5,11,12,21,20,14,16},
      k = 5,
      n = 11;
  printf("%ith (of %i) smallest element is %i\n",
    k, n, selection_algorithm(a, n, k));
}
```

```
5th (of 11) smallest element is 11
```


Javascript
---

```
  var select = require("./min_select.js");
  let a = [11,9,6,10,5,11,12,21,20,14,16];
  let k = 5;
  console.log(k, "th (of", a.length, ") element is", select.select(a,k));
```

```
5 th (of 11 ) element is 11
```

License
---

CC0


