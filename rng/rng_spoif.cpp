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

#include <vector>
#include <string>
#include <map>

#define _EPS (1.0 / (1024.0*1024.0*1024.0))

static double _RND() {
  return ((double)rand()) / (RAND_MAX + 1.0);
}

class RELATIVE_NEIGHBORHOOD_GRAPH {
  public:

    // dimeinsion and point list
    //
    int32_t   m_dim;
    std::vector< double > m_P;

    double    m_ds;
    double    m_bbox[3][2];
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
    double    m_grid_cell_size;

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
    double    m_fencePost_v[6][9];
    int64_t   m_fencePostCluster[4][4];

    // cache for easier lookup
    //
#define _FPR_MAX_IR 3
    double    m_fpR_max_ir;
    double    m_fpR_v[_FPR_MAX_IR][6][9];

    RELATIVE_NEIGHBORHOOD_GRAPH() {
      m_eps = _EPS;

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
    }

    int32_t p2grid_ixyz( int64_t *ixyz, double *p ) {

      if (m_dim == 3) {
        ixyz[0] = (int64_t)floor( ((double)grid_n) * p[0] );
        ixyz[1] = (int64_t)floor( ((double)grid_n) * p[1] );
        ixyz[2] = (int64_t)floor( ((double)grid_n) * p[2] );
        return 0;
      }

      else if (m_dim == 2) {
        ixyz[0] = (int64_t)floor( ((double)grid_n) * p[0] );
        ixyz[1] = (int64_t)floor( ((double)grid_n) * p[1] );
        return 0;
      }

      return -1;
    }

    int64_t grid_ixyz2pos( int64_t *ixyz ) {
      int64_t pos=-1;
      pos = ((ixyz[2]*grid_n*grid_n) + (ixyz[1]*grid_n) + ixyz[0]);
      return pos;
    }


    int32_t init() {
      int64_t i, j, k;
      int64_t n_ele = 0, v_idx;
      int64_t grid_tot;
      int64_t ix=-1, iy=-1, iz=-1,
              ixyz[3] = {0};
      double n_d = 0.0;

      std::map< int64_t, int64_t > _em;

      n_ele = (m_P.size() / m_dim);
      n_d = (double)n_ele;

      m_eps = _EPS;

      m_grid_s = ((m_dim == 3) ? cbrt(n_d) : sqrt(n_d));
      m_grid_n = (int64_t)ceil(m_grid_s);
      m_ds = 1.0 / m_grid_s;

      m_Ve_map.clear();
      for (v_idx=0; v_idx < n_ele; v_idx++) {
        m_Ve_map.push_back( _em );

        for (i=0; i<m_dim; i++) {
          m_P_grid_idx_bp.push_back(-1);
        }
      }

      grid_tot = ( (m_dim == 3) ? (grid_n*grid_n*grid_n) : (grid_n*grid_n) );
      m_grid.clear();
      for (i=0; i<grid_tot; i++) {
        m_grid.push_back();
      }

      for (v_idx=0; v_idx < n_ele; v_idx++) {
        p2grid_ixyz( ixyz, (&(m_P[0])) + (m_dim*v_idx) );
        pos = grid_ixyz2pos( ixyz );

        m_grid[pos].push_back( v_idx );
        m_P_grid_idx_bp.push_back( ixyz[0] );
        m_P_grid_idx_bp.push_back( ixyz[1] );
        if (m_dim == 3) {
          m_P_grid_idx_bp.push_back( ixyz[2] );
        }
      }

      return 0;
    }

    int32_t pointInit(std::vector< double > &pnt, int32_t dim) {
      int64_t i, j, n_ele=0, pos=0;

      if ((dim != 2) && (dim != 3)) { return -1; }
      m_dim = dim;

      m_P.clear();

      n_ele = (int64_t)(pnt.size() / m_dim);

      for (i=0; i < n_ele; i++) {
        for (j=0; j < m_dim; j++) {

          pos = (m_dim*(i)) + j;
          if (pos >= n_ele) { return -1; }

          m_P.push_back( pnt[pos] );

        }
      }

      return init();
    }

    int32_t poissonInit(int32_t n_point, int32_t dim) {
      int32_t i, j;

      if ((dim != 2) && (dim != 3)) { return -1; }

      m_dim = dim;
      m_P.clear();

      for (i=0; i<n_point; i++) {
        for (j=0; j<m_dim; j++) {
          m_P.push_back( _RND() );
        }
      }

      return init();
    }

    void printP(void) {
      int64_t i, n_ele = 0;

      n_ele = (int64_t)(m_P.size()/3);
      for (i=0; i < n_ele; i++) {
        if (m_dim == 2) {
          printf("%f %f\n\n", m_P[(2*i) + 0], m_P[(2*i) + 1]);
        }
        else if (m_dim == 3) {
          printf("%f %f %f\n\n", m_P[(3*i) + 0], m_P[(3*i) + 1], m_P[(3*i) + 2]);
        }
      }
    }

    void printInfo(void) {
    }

    int32_t SPoIF_2d_v() {
      return -1;
    }

    int32_t SPoIF_2d() {
      int64_t n_idir = 4;
      int64_t ir, idir, fpi;
      double fpv[3] = {0};

      m_fencePost_v[0][0][0] =  fL; m_fencePost_v[0][0][1] = -fL;
      m_fencePost_v[0][1][0] =  fL; m_fencePost_v[0][1][1] =   0;
      m_fencePost_v[0][1][0] =  fL; m_fencePost_v[0][1][1] =  fL;

      m_fencePost_v[1][0][0] = -fL; m_fencePost_v[1][0][1] = -fL;
      m_fencePost_v[1][1][0] = -fL; m_fencePost_v[1][1][1] =   0;
      m_fencePost_v[1][1][0] = -fL; m_fencePost_v[1][1][1] =  fL;

      m_fencePost_v[2][0][0] = -fL; m_fencePost_v[2][0][1] =  fL;
      m_fencePost_v[2][1][0] =   0; m_fencePost_v[2][1][1] =  fL;
      m_fencePost_v[2][1][0] =  fL; m_fencePost_v[2][1][1] =  fL;

      m_fencePost_v[3][0][0] = -fL; m_fencePost_v[3][0][1] = -fL;
      m_fencePost_v[3][1][0] =   0; m_fencePost_v[3][1][1] = -fL;
      m_fencePost_v[3][1][0] =  fL; m_fencePost_v[3][1][1] = -fL;

      for (ir=0; ir <= m_fpR_max_ir; ir++) {
        for (idir=0; idir < n_idir; idir++) {
          for (fpi=0; fpi < 3; fpi++) {

            fpv[0] = m_ds*((2.0*((double)ir)) + 1.0) * m_fencePost_v[idir][fpi][0];
            fpv[1] = m_ds*((2.0*((double)ir)) + 1.0) * m_fencePost_v[idir][fpi][1];

            fpR_v[ir][idir][fpi][0] = fpv[0];
            fpR_v[ir][idir][fpi][1] = fpv[1];
          }
        }
      }




      return -1;
    }

    int32_t SPoIF_3d_v() {
      return -1;
    }

    int32_t SPoIF_3d() {
      return -1;
    }

};

int main(int argc, char **argv) {

  RELATIVE_NEIGHBORHOOD_GRAPH rng;

  rng.poissonInit(100, 3);
  rng.printP();
}


