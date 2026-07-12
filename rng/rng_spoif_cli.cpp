// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <getopt.h>

#include <math.h>
#include <string.h>

#include <sys/time.h>

#include <vector>
#include <string>
#include <map>

#include "rng_spoif.hpp"

int rng_cmp(RELATIVE_NEIGHBORHOOD_GRAPH &rng0, RELATIVE_NEIGHBORHOOD_GRAPH &rng1) {
  int64_t i, j, k, n_ele, n_nei;
  int64_t p_idx;
  int64_t nei_idx0, nei_idx1, nei_idx;

  double u[3] = {0}, v[3] = {0};

  int _debug = 1;

  std::map< int64_t, int64_t >::iterator it0, it1, it;

  if (rng0.m_P.size() != rng1.m_P.size()) { return -1; }
  if (rng0.m_dim != rng1.m_dim) { return -2; }

  n_ele = (int64_t)(rng0.m_P.size() / rng0.m_dim);

  for (p_idx=0; p_idx < n_ele; p_idx++) {

    if (rng0.m_Ve_map[p_idx].size() != rng1.m_Ve_map[p_idx].size()) {

      if (_debug > 0) {

        for (i=0; i<rng0.m_dim; i++) {
          u[i] = rng0.m_P[ rng0.m_dim*p_idx + i ];
          v[i] = rng1.m_P[ rng1.m_dim*p_idx + i ];
        }

        printf("MISMATCH: |rng0.m_Ve_map[%i]|:%i (%f,%f,%f) != |rng1.m_Ve_map[%i]|:%i (%f,%f,%f)\n",
            (int)p_idx, (int)rng0.m_Ve_map[p_idx].size(),
            u[0], u[1], u[2],
            (int)p_idx, (int)rng1.m_Ve_map[p_idx].size(),
            v[0], v[1], v[2] );

        printf("  nei0:");
        for (it = rng0.m_Ve_map[p_idx].begin(); it != rng0.m_Ve_map[p_idx].end(); ++it) {
          nei_idx = it->first;
          if (rng0.m_dim==2) {
            printf(" u%i(%f,%f)", (int)nei_idx, rng0.m_P[2*nei_idx], rng0.m_P[2*nei_idx+1]);
          }
          else if (rng0.m_dim==3) {
            printf(" u%i(%f,%f,%f)", (int)nei_idx, rng0.m_P[3*nei_idx], rng0.m_P[3*nei_idx+1],rng0.m_P[3*nei_idx+2]);
          }
        }
        printf("\n");

        printf("  nei1:");
        for (it = rng1.m_Ve_map[p_idx].begin(); it != rng1.m_Ve_map[p_idx].end(); ++it) {
          nei_idx = it->first;
          if (rng1.m_dim==2) {
            printf(" u%i(%f,%f)", (int)nei_idx, rng1.m_P[2*nei_idx], rng1.m_P[2*nei_idx+1]);
          }
          else if (rng1.m_dim==3) {
            printf(" u%i(%f,%f,%f)", (int)nei_idx, rng1.m_P[3*nei_idx], rng1.m_P[3*nei_idx+1],rng1.m_P[3*nei_idx+2]);
          }
        }
        printf("\n");

      }

      return -3;
    }


    for (it0 = rng0.m_Ve_map[p_idx].begin(), it1 = rng1.m_Ve_map[p_idx].begin() ;
         (it0 != rng0.m_Ve_map[p_idx].end()) && (it1 != rng1.m_Ve_map[p_idx].end()) ;
         ++it0, ++it1) {

      nei_idx0 = it0->first;
      nei_idx1 = it1->first;

      if (nei_idx0 != nei_idx1) { return -4; }
      
    }

  }


  return 0;
}

void spot_check_sweep2d() {
  int i;
  int64_t p_idx;
  double *p;
  std::vector< int64_t > sweep2d;
  RELATIVE_NEIGHBORHOOD_GRAPH rng;

  rng.poissonInit(1000, 2);
  //rng.printP();


  p_idx = 500;

  rng.grid_sweep_perim_2d(sweep2d, &(rng.m_P[2*p_idx]), 1);

  p = &(rng.m_P[2*p_idx]);

  printf("??? %f %f\n", p[0], p[1]);

  for (i=0; i<sweep2d.size(); i+=2) {
    printf("sweep2d[%i]: [%i,%i]\n", (int)i, (int)sweep2d[i], (int)sweep2d[i+1]);
  }

}



void spot_check_Nd(int64_t n = 1000, int32_t D=2, int aux = 0) {
  int res;

  RELATIVE_NEIGHBORHOOD_GRAPH rng, rng_slo;
  srand(1234);

  if (aux == 1) { rng.m_optimize_experiment = 1; }

  rng.poissonInit( n, D );
  rng_slo.pointInit( rng.m_P, D );

  if      (D == 2) { rng.SPoIF_2d(); }
  else if (D == 3) { rng.SPoIF_3d(); }
  rng_slo.RNG_naive();

  res = rng_cmp(rng, rng_slo);

  printf("#got: %i\n", res);
}

void run_Nd( int64_t n = 1000, int32_t dim = 2, int aux = 0) {
  FILE *fp;
  std::string ofn = "out.gp";
  int64_t p_idx, n_ele;

  RELATIVE_NEIGHBORHOOD_GRAPH rng;
  srand(1234);

  rng.poissonInit( n, dim );

  if (aux == 1) { rng.m_optimize_experiment = 1; }

  if      (dim == 2) { rng.SPoIF_2d(); }
  else if (dim == 3) { rng.SPoIF_3d(); }

  n_ele = (int64_t)(rng.m_P.size() / rng.m_dim);


  /*
  for (p_idx=0; p_idx < n_ele; p_idx++) {
    if (dim == 2) {
      printf("#p%i (%f,%f)\n", (int)p_idx, rng.m_P[2*p_idx], rng.m_P[2*p_idx+1]);
    }
    else if (dim == 3) {
      printf("#p%i (%f,%f,%f)\n", (int)p_idx, rng.m_P[3*p_idx], rng.m_P[3*p_idx+1], rng.m_P[3*p_idx+2]);
    }
  }
  */

  //fp = fopen("out0.gp", "w");
  fp = fopen( ofn.c_str(), "w" );
  rng.printE(fp);
  fclose(fp);
}

void _naive2d() {
  int res;
  RELATIVE_NEIGHBORHOOD_GRAPH rng;
  srand(1234);
  rng.poissonInit(100, 2);
  res = rng.RNG_naive();
  printf("#got: %i\n", res);
  rng.printE();
}

int main(int argc, char **argv) {

  int64_t n = 100;
  std::string op;

  int aux = 0;

  if (argc > 1) {
    op = argv[1];
    if (argc > 2) {
      n = (int64_t)atoi(argv[2]);
      if (argc > 3) {
        aux = 1;
      }
    }
  }

  if      (op == "2d") { run_Nd(n,2, aux); }
  else if (op == "3d") { run_Nd(n,3, aux); }
  else if (op == "2d.check") { spot_check_Nd(n, 2, aux); }
  else if (op == "3d.check") { spot_check_Nd(n, 3, aux); }

  else {
    printf("\n... rng_spoif <2d[.check]|3d[.check]> [n]\n\n");
  }

  return 0;
}

