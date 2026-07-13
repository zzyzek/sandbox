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

#include <getopt.h>

#include "rng_spoif.hpp"

#define SPOIF_RNG_MAIN_VERSION "0.1.0"

int g_verbose = 0;

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


int spot_check_Nd(int64_t n = 1000, int32_t D=2, int aux = 0) {
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

  return res;
  //printf("#got: %i\n", res);
}

void run_Nd( int64_t n, int32_t dim, std::string *ofn = NULL, unsigned int seed = 0) {
  FILE *fp = stdout;

  RELATIVE_NEIGHBORHOOD_GRAPH rng;

  if (seed > 0) { srand(seed); }

  rng.m_verbose = g_verbose;

  rng.poissonInit( n, dim );

  if      (dim == 2) { rng.SPoIF_2d(); }
  else if (dim == 3) { rng.SPoIF_3d(); }

  if (ofn) { fp = fopen( ofn->c_str(), "w" ); }
  rng.printE(fp);
  if (ofn) { fclose(fp); }
}

void run_naive_Nd( int64_t n, int32_t dim, std::string *ofn = NULL, unsigned int seed = 0) {
  int res;
  FILE *fp = stdout;
  RELATIVE_NEIGHBORHOOD_GRAPH rng;

  if (seed > 0) { srand(seed); }

  rng.m_verbose = g_verbose;

  rng.poissonInit(n, dim);
  res = rng.RNG_naive();

  if (ofn) { fp = fopen( ofn->c_str(), "w" ); }
  rng.printE(fp);
  if (ofn) { fclose(fp); }
}

static struct option long_options[] = {

  {"n",         required_argument,  0, 'n' },
  {"dim",       required_argument,  0, 'd' },
  {"seed",      required_argument,  0, 'S' },
  {"check",     no_argument,        0, 'C' },

  {"ofn",       required_argument,  0, 'o' },
  {"ifn",       required_argument,  0, 'i' },
  {"algorithm", required_argument,  0, 'A' },

  {"verbose",   required_argument,  0, 'V' },
  {"help",      no_argument,        0, 'h' },
  {"version",   no_argument,        0, 'v' },
  {0,           0,                  0,  0  },
};

static char long_options_descr[][128] = {
  "number of points",
  "dimension",
  "random number seed",
  "check against naive (slow)",

  "output edges to file",
  "input points from file",

  "algorithm to use (default SPoIF)",

  "verbose level",
  "help (this screen)",
  "show version",
  0
};

void print_version(FILE *fp) {
  fprintf(fp, "RNG SPoIF bin version: %s\n", SPOIF_RNG_MAIN_VERSION);
  fprintf(fp, "RNG SPoIF lib version: %s\n", SPOIF_RNG_VERSION);
}

void print_help(FILE *fp) {
  int lo_idx=0,
      spacing=0,
      ii;
  struct option *lo;

  fprintf(fp, "\n");
  print_version(fp);
  fprintf(fp, "\n");

  for (lo_idx=0; long_options[lo_idx].name; lo_idx++) {

    fprintf(fp, "  -%c,--%s ",
        long_options[lo_idx].val,
        long_options[lo_idx].name);

    spacing = 12 - strnlen(long_options[lo_idx].name, 127);
    for (ii=0; ii<spacing; ii++) { fprintf(fp, " "); }

    fprintf(fp, "%s\n", long_options_descr[lo_idx]);
  }

  fprintf(fp, "\n");
}

int splitStr( std::vector< std::string > &tok, std::string s, int sep ) {
  int i;
  std::string cur;

  tok.clear();

  for (i=0; i<s.size(); i++) {
    if (s[i]==sep) {
      tok.push_back(cur);
      cur.clear();
      continue;
    }
    cur += s[i];
  }

  tok.push_back(cur);
  return 0;
}

int main(int argc, char **argv) {
  RELATIVE_NEIGHBORHOOD_GRAPH rng;

  int ch, opt_idx=0;

  int opt_V = 0,
      opt_S = 1,
      opt_n = 0,
      opt_d = 2,
      opt_c = 0;
  std::string opt_o = "/dev/stdout",
              opt_i,
              opt_A;

  while (ch = getopt_long(argc, argv, "hvV:S:n:d:co:i:A:", long_options, &opt_idx)) {
    if (ch<0) { break; }
    switch (ch) {
      case 'h':
        print_help(stdout);
        return 0;
        break;
      case 'v':
        print_version(stdout);
        return 0;
        break;
      case 'V':
        opt_V++;
        break;

      case 'S':
        opt_S = atoi(optarg);
        break;

      case 'n':
        opt_n = atoi(optarg);
        break;
      case 'd':
        opt_d = atoi(optarg);

      case 'c':
        opt_c = 1;
        break;

      case 'o':
        opt_o = optarg;
        break;

      case 'i':
        opt_i = optarg;
        break;

      case 'A':
        opt_A = optarg;
        break;

      default:
        fprintf(stderr, "unknown option\n\n");
        print_help(stderr);
        exit(-1);
        break;

    }
  }

  //printf("%i %i %i\n", opt_n, opt_d, opt_S);


  if (opt_n <= 0) {
    fprintf(stderr, "provide number of points (-n)\n\n");
    print_help(stderr);
    exit(-1);
  }

  if ((opt_d != 2) && (opt_d != 3)) {
    fprintf(stderr, "dimension must be 2 or 3 (-d)\n\n");
    print_help(stderr);
    exit(-1);
  }

  g_verbose = opt_V;

  if      (opt_A.size() == 0) { run_Nd( opt_n, opt_d, (opt_o.size() == 0) ? NULL: &opt_o, opt_S ); }
  else if (opt_A == "naive")  { run_naive_Nd( opt_n, opt_d, (opt_o.size() == 0) ? NULL : &opt_o, opt_S ); }

  return 0;
}

