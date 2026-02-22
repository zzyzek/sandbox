// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

#include <stdio.h>
#include <stdlib.h>
#include <string.h>

#include <stdint.h>

int swap(int *a, int *b) {
  int t;
  t = *a;
  *a = *b;
  *b = t;
  return 0;
}

void print_a_flat(int *a, int n) {
  int i;
  printf("[%i]:", n);
  for (i=0; i<n; i++) {
    printf(" %i", a[i]);
  }
  printf("\n");
}

int simpsort(int *a, int n) {
  int i, j, k;
  for (i=0; i<n; i++) {
    for (j=1; j<(n-i); j++) {
      if (a[j-1] > a[j]) { swap(a+j-1, a+j); }
    }
  }
  return 0;
}

int bubble_sort(int *a, int n) {
  int i, j, k;
  for (i=0; i<n; i++) {
    for (j=1; j<(n-i); j++) {
      if (a[j-1] > a[j]) { swap(a+j-1, a+j); }
    }
  }
  return 0;
}

int select_k_large(int *a, int n, int kl) {
  int i, v, b, e;
  int g = n/5;

  // base case, simple sort, putting
  // median value in 0 position,
  // then return
  //
  if (!g) {
    if (n) {
      bubble_sort(a,n); 
      swap(a, a+kl);
    }
    return a[0];
  }

  // sort blocks of 5
  // collect median of each 5 block into
  //   beginning of array.
  //
  for (i=0; i<g; i++) {
    simpsort(a+5*i,5);
    swap(a+i, a+(5*i)+2);
  }

  // recur
  // We want the median (halfway element) of
  // the remaining n/5 elements, so n/10
  //
  select_k_large(a,g, n/10);

  // a[0] is our pivot element now
  //
  v = a[0];

  // collect elements smaller than pivot
  // at the beginning and larger than the pivot
  // at the end
  //
  for (b=1, e=(n-1); (e-b)>0; ) {
    if (a[b] > v) { swap(a+b, a+e); e--; }
    else          { b++; }
  }

  // put pivot element in the middle
  //
  if (a[b] > v) { b--; }
  swap(a, a+b);

  // if we've found our kl largest element,
  // put it in position 0 and return
  //
  if (b == kl) {
    swap(a, a+kl);
    return a[0];
  }

  // else if kl smaller, recur on left side
  //
  else if (kl < b) {
    select_k_large(a,b,kl);
  }

  // otherwise recur on right side
  //
  else {
    select_k_large(a+b+1,n-b-1,kl-b-1);
    swap(a+b+1, a);
  }

  return a[0];
}

void fisher_yates_shuffle(int *a, int n) {
  int i, j, k;
  for (i=0; i<(n-1); i++) {
    k = i + (rand()%(n-i));
    swap(a+i, a+k);
  }
}

void print_a(int *a, int n) {
  int i;

  for (i=0; i<n; i++) {
    printf("[%i]: %i\n", i, a[i]);
  }
}

int icmp(const void *a, const void *b) {
  int *ia, *ib;
  ia = (int *)a;
  ib = (int *)b;

  if ( (*ia) < (*ib) ) { return -1; }
  if ( (*ia) > (*ib) ) { return  1; }
  return 0;
}

int _experiment(int n, int n_it) {
  int i, j, k, it = 0;
  int *A = NULL, *B = NULL, *_orig = NULL;

  _orig = (int *)malloc(sizeof(int)*n);
  A = (int *)malloc(sizeof(int)*n);
  B = (int *)malloc(sizeof(int)*n);

  for (it=0; it<n_it; it++) {

    for (i=0; i<n; i++) { _orig[i] = rand()%(2*n); }
    for (i=0; i<n; i++) { B[i] = _orig[i]; }
    qsort(B, n, sizeof(int), icmp);

    for (k=0; k<n; k++) {

      for (i=0; i<n; i++) { A[i] = _orig[i]; }

      select_k_large(A, n, k);

      if (A[0] != B[k]) { return -1; }

      printf("\nit%i.k%i:", it, k);
      print_a_flat(A, n);
      printf("it%i.k%i:", it, k);
      print_a_flat(B, n);
    }

  }

  free(A);
  free(B);
  free(_orig);

  return 0;
}

int selection_algorithm(int *a, int n, int idx) {
  select_k_large(a,n,idx);
  return a[0];
}

int ___main(int argc, char **argv) {
  int i, n = 37, *a = NULL,
      val, idx;
  int seed = 0;

  if (argc > 1) { seed = atoi(argv[1]); }

  srand(seed);

  a = (int *)malloc(sizeof(int)*n);
  for (i=0; i<n; i++) { a[i] = rand()%(2*n); }

  idx = rand()%n;
  val = selection_algorithm(a,n,idx);

  printf("a[%i]:", n);
  for (i=0; i<n; i++) { printf(" %i", a[i]); }
  printf("\n%i'th value: %i\n", idx, val);

  free(a);
}

int main(int argc, char **argv) {
  int n = 10, r = -1;
  if (argc > 1) {
    n = atoi(argv[1]);
    if (n < 0) { n = 10; }
  }

  r = _experiment(n, 10);

  printf("got: %i\n", r);

}

int _main(int argc, char **argv) {
  int *A = NULL, *B = NULL;
  int i, j, k, n = 26;

  k = 12;
  if (argc > 1) {
    k = atoi(argv[1]);
    if (k < 0) { k = 0; }
    if (k >= n) { k = n-1; }
  }

  A = (int *)malloc(sizeof(int)*n);
  B = (int *)malloc(sizeof(int)*n);

  for (i=0; i<n; i++) { A[i] = i; }


  fisher_yates_shuffle(A,n);

  for (i=0; i<n; i++) { B[i] = A[i]; }

  select_k_large(A,n, k);

  //simpsort(A,n);

  print_a(A,n);

  free(A);
}
