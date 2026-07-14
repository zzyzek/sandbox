// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

#ifndef SPOIF_RNG
#define SPOIF_RNG

#define SPOIF_RNG_VERSION "0.1.0"

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

#include <unistd.h>

#define SPOIF_RNG_EPS (1.0 / (1024.0*1024.0*1024.0))

//---
//---
//---

typedef struct i64_d_type {
  int64_t i;
  double d;
} i64_d_t;

int i64_d_cmp(const void *_a, const void *_b);


//---
//---
//---

typedef struct prof_ctx_type {
  double Ts, Te, dT;
  int64_t c;
} prof_ctx_t;

//---
//---
//---


extern double (*_RND)(void);

double SPOIF_RNG_RND(void);

//---
//---
//---

/*
static int32_t poissonPoint(std::vector< double > &P, int64_t n, int32_t dim) {
  int64_t i, j;

  P.clear();
  for (i=0; i<n; i++) {
    for (j=0; j<dim; j++) {
      P.push_back( _RND() );
    }
  }

  return 0;
}
*/

/*
static int32_t _v2idir(double *v, int32_t dim) {
  int32_t max_xyz = 0;
  double max_val = v[0];
  int32_t xyz = 0;

  for (xyz=0; xyz<dim; xyz++) {
    if (fabs(v[xyz]) > max_val) {
      max_xyz = xyz;
      max_val = fabs(v[xyz]);
    }
  }

  if (v[max_xyz] < 0) { return (2*max_xyz)+1; }
  return 2*max_xyz;
}
*/

class RELATIVE_NEIGHBORHOOD_GRAPH {
  public:

    // dimeinsion and point list
    //
    int32_t   m_dim;
    std::vector< double > m_P;

    double    m_ds;
    double    m_bbox[2][3];
    double    m_idir_v[6][3];

    double    m_eps;

    // idir information:
    //
    //   vector direction
    //   index of opposite direction
    //
    double    m_v_idir[6][3];
    int64_t   m_idir_oppo[6];


    // start and side size of square/cube
    //
    double    m_start[3];
    double    m_size[3];

    // grid cell size, grid count in each dim
    //
    double    m_grid_s;
    int64_t   m_grid_n;
    double    m_grid_cell_size[3];

    // grid holds index of point
    //
    // m_P_idx_grid_bp maps point back to grid
    //   flattened
    //
    std::vector< std::vector< int64_t > > m_grid;
    std::vector< int64_t > m_P_idx_grid_bp;

    double    m_grid_start[3];
    double    m_grid_size[3];

    std::vector< std::map< int64_t, int64_t > > m_Ve_map;
    //std::map< int64_t, std::map< int64_t, int64_t > > m_Ve_map;

    // fencepost information
    //   fencePost_v vecotr relative to origin
    //   cluster of vectors
    //
    double    m_fencePost_v[6][9*3];
    int64_t   m_fencePostCluster[4][4];

    int64_t   m_fencePost_n;

    // cache for easier lookup
    //
#define _FPR_MAX_IR 3
    double    m_fpR_max_ir;
    double    m_fpR_v[(_FPR_MAX_IR+1)][6][9*3];

    int       m_verbose;
    int       m_optimize_experiment;
    std::map< std::string, prof_ctx_t > m_prof;

    int       m_profile_level;

    RELATIVE_NEIGHBORHOOD_GRAPH() {
      m_eps = SPOIF_RNG_EPS;

      m_fpR_max_ir = _FPR_MAX_IR;

      m_v_idir[0][0] =  1; m_v_idir[0][1] =  0; m_v_idir[0][2] =  0;
      m_v_idir[1][0] = -1; m_v_idir[1][1] =  0; m_v_idir[1][2] =  0;

      m_v_idir[2][0] =  0; m_v_idir[2][1] =  1; m_v_idir[2][2] =  0;
      m_v_idir[3][0] =  0; m_v_idir[3][1] = -1; m_v_idir[3][2] =  0;

      m_v_idir[4][0] =  0; m_v_idir[4][1] =  0; m_v_idir[4][2] =  1;
      m_v_idir[5][0] =  0; m_v_idir[5][1] =  0; m_v_idir[5][2] = -1;

      m_idir_oppo[0] = 1; m_idir_oppo[1] = 0;
      m_idir_oppo[2] = 3; m_idir_oppo[3] = 2;
      m_idir_oppo[4] = 5; m_idir_oppo[5] = 4;

      m_dim = -1;

      m_fencePost_n = -1;

      m_verbose = 0;
      m_optimize_experiment = 0;
      m_profile_level = 0;
    }

    int32_t consistency(void);
    int32_t p2grid_ixyz( int64_t *ixyz, double *p );
    int32_t oob(double *v);
    int64_t grid_ixyz2pos( int64_t *ixyz );

    int32_t init(void);
    int32_t pointInit(std::vector< double > &pnt, int32_t dim);
    int32_t poissonInit(int32_t n_point, int32_t dim);
    void printP(FILE *ofp = stdout);
    void printE(FILE *ofp = stdout);

    int32_t grid_sweep_perim_2d(std::vector< int64_t > &sweep_xy, double *p, int64_t ir);
    int oobixyz(int64_t ix, int64_t iy, int64_t iz, int64_t bb[][3]);
    int32_t grid_sweep_perim_3d(std::vector< int64_t > &sweep_xyz, double *p, int64_t ir);
    int32_t in_lune_2d(double *a, double *b, double *c);
    int32_t in_lune_3d(double *a, double *b, double *c);
    int32_t in_lune_Nd(double *a, double *b, double *c, int32_t D);
    int32_t RNG_naive(void);
    int32_t RNGv_fence(int64_t p_idx, std::vector< int64_t > &q_sched, std::vector< int64_t > &q_saboteur);
    int32_t RNGv_fence_opt1(int64_t p_idx, std::vector< int64_t > &q_sched, std::vector< i64_d_t > &q_sabo_dist);
    int32_t RNGv_naive(int64_t p_idx, std::vector< int64_t > &q_sched);

    // SPoIF_2d_v
    //
    // Calculate the relative neighborhood graph for vertex referenced by p_idx
    // using the Shrinking Posts on Increasing Fence (SPoIF) algorithm.
    //
    // This will update m_Ve_map with the appropriate edges, in both diections
    // (p_idx to neighbor, neighbor to p_idx).
    //
    // 2026-07-09: both the 2d and 3d version have a bug that I'm tracking down.
    //   to recreate, here, for 2d: 2000 vertex count, seed 1234
    //   spoif misses an edge from v1341 (0.819533,0.198840) whereas
    //   naive has one
    //   fixed, was fps_cache indexing issue
    //
    // 2026-07-09: 2d 10000 seed 1234 has mismatch edge for
    //   v311(0.659538,0.811543), spoif as (incorrect) edge to v9697(0.638765,0.800436)
    //   whereas naive rng does not
    //
    // 2026-07-11: as referenced above, there is a conceptual error where
    //   the fence needs to be extended to include other vertices that could act
    //   as saboteurs to potential edges
    //   - only vertices within the fence have the potential for an RNG edge between them
    //   - *but* potential edges for vertices within the fence might not be allowed when
    //     adding extra vertices beyond the fence (vertices beyond fence can sabotage
    //     a RNG edge)
    //   I'm going to try for an implementation that:
    //   - keep a running maximum distance from p_idx to each of the vertices in q_list
    //   - add a saboteur list from vertices that sit in the shell past the current ir
    //     but less than or equal to the grid radius from maximum distance
    //   - creates a new RNGv_naive that takes in a saboteur list to make sure
    //     any potential edge from p_idx to q_list is not contradicted by someone in
    //     the saboteur list
    //   bounds on the maximum distance ( (1/2)(k+3) for 2d, (3/4)(k+3) for 3d) mean
    //   we know we don't have to go to far.
    //
    //   
    //
    int32_t SPoIF_2d_v(int64_t p_idx);
    int32_t SPoIF_2d(void);

    int32_t SPoIF_3d_v(int64_t p_idx);
    int32_t SPoIF_3d();
};

#endif
