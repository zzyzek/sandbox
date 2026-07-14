// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
//
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

#include "rng_spoif.hpp"

//---
//---
//---


//static double SPOIF_RNG_RND() { return ((double)rand()) / (RAND_MAX + 1.0); }
//static double (*_RND)(void) = SPOIF_RNG_RND;


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


//---
//---
//---

int i64_d_cmp(const void *_a, const void *_b) {
  i64_d_t *a, *b;

  a = (i64_d_t *)_a;
  b = (i64_d_t *)_b;

  if ( a->d < b->d ) { return  1; }
  if ( a->d > b->d ) { return -1; }
  return 0;
}


double SPOIF_RNG_RND() {
  return ((double)rand()) / (RAND_MAX + 1.0);
}

double (*_RND)(void) = SPOIF_RNG_RND;

//---
//---
//---

void _prof_s( std::map< std::string, prof_ctx_t > &ctx, const char *_key) {
  std::string key;
  struct timeval tv;
  double t;
  prof_ctx_t *pctx,
             em = {0};
  std::map< std::string, prof_ctx_t >::iterator lu;

  key = _key;

  gettimeofday(&tv, NULL);
  t = ((double)tv.tv_sec) + (((double)tv.tv_usec)/1000000.0);

  if (ctx.find(key) == ctx.end()) { ctx[key] = em; }

  lu = ctx.find(key);
  pctx = &(lu->second);

  pctx->Ts = t;
}

void _prof_e( std::map< std::string, prof_ctx_t > &ctx, const char *_key) {
  std::string key;
  struct timeval tv;
  double t;
  prof_ctx_t *pctx,
             em = {0};
  std::map< std::string, prof_ctx_t >::iterator lu;

  key = _key;

  gettimeofday(&tv, NULL);
  t = ((double)tv.tv_sec) + (((double)tv.tv_usec)/1000000.0);


  if (ctx.find(key) == ctx.end()) { ctx[key] = em; }

  lu = ctx.find(key);
  pctx = &(lu->second);

  pctx->Te = t;
  pctx->dT += (pctx->Te - pctx->Ts);
  pctx->c++;
}

void _prof_reset( std::map< std::string, prof_ctx_t > &ctx, std::string &key) {
  //struct timeval tv;
  //double t;
  prof_ctx_t *pctx,
             em = {0};
  std::map< std::string, prof_ctx_t >::iterator lu;

  if (ctx.find(key) == ctx.end()) { ctx[key] = em; }

  lu = ctx.find(key);
  pctx = &(lu->second);

  pctx->Ts = 0.0;
  pctx->Te = 0.0;
  pctx->dT = 0.0;
  pctx->c = 0;
}

double _prof_avg( std::map< std::string, prof_ctx_t > &ctx, std::string &key) {
  //struct timeval tv;
  //double t;
  prof_ctx_t *pctx;
             //em = {0};
  std::map< std::string, prof_ctx_t >::iterator lu;

  if (ctx.find(key) == ctx.end()) { return 0; }

  lu = ctx.find(key);
  pctx = &(lu->second);

  if (pctx->c == 0) { return 0; }

  return (pctx->dT) / ((double)(pctx->c));
}

void _prof_print( std::map< std::string, prof_ctx_t > &ctx ) {
  prof_ctx_t *pctx;
  std::map< std::string, prof_ctx_t >::iterator lu;

  for (lu = ctx.begin(); lu != ctx.end() ; ++lu) {
    pctx = &(lu->second);

    printf("# %s %fs (%fms / # %i )\n",
        lu->first.c_str(),
        pctx->dT / ( (pctx->c==0) ? 1.0 : ((double)pctx->c) ),
        1000.0*(pctx->dT),
        (int)pctx->c);
  }
}



//---
//---
//---

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::consistency(void) {
  double  v[3] = {0},
          Bl[3] = {0}, Bs[3] = {0};
  int64_t v_idx, nei_idx,
          n_ele,
          grid_size,
          ixyz[3] = {0};
  int64_t pos, c, _m;
  int _found;
  int32_t i;

  int _debug = m_verbose;

  std::vector< int64_t > grid_count;

  std::map< int64_t, int64_t >::iterator it;

  n_ele = (int64_t)(m_P.size() / m_dim);
  grid_size = m_grid_n*m_grid_n;
  if (m_dim == 3) { grid_size *= m_grid_n; }
  for (i=0; i<grid_size; i++) { grid_count.push_back( m_grid[i].size() ); }

  for (i=0; i<m_dim; i++) {
    Bs[i] = m_bbox[0][i];
    Bl[i] = m_bbox[1][i] - m_bbox[0][i];
  }

  if (_debug > 0) {
    printf("# consistency Bs(%f,%f,%f) Bl(%f,%f,%f), |grid|:%i\n",
        Bs[0], Bs[1], Bs[2],
        Bl[0], Bl[1], Bl[2],
        (int)grid_size);
  }

  for (v_idx=0; v_idx < n_ele; v_idx++) {

    for (i=0; i<m_dim; i++) {
      v[i] = m_P[m_dim*v_idx + i];
      ixyz[i] = (int64_t)floor( m_grid_n * Bl[i]*(v[i] - Bs[i]) );
    }

    for (i=0; i<m_dim; i++) {
      if ((ixyz[i] < 0) || (ixyz[i] >= m_grid_n)) {
        return -2;
      }
    }

    _found = 0;
    pos = 0;
    c = 1;
    for (i=0; i<m_dim; i++) { pos += c*ixyz[i]; c *= m_grid_n; }
    _m = m_grid[pos].size();
    for (i=0; i<_m; i++) {
      if (m_grid[pos][i] == v_idx) { _found = 1; break; }
    }

    if (_found == 0) {

      if (_debug > 0) {
        printf("# v_idx: %i (%f,%f,%f) was not found at grid[x%i,y%i,z%i;%i] (/%i) ",
            (int)v_idx, v[0], v[1], v[2],
            (int)ixyz[0], (int)ixyz[1], (int)ixyz[2],
            (int)pos, (int)m_grid_n);

      }

      return -3;
    }

    for (i=0; i<m_dim; i++) {
      if ( m_P_idx_grid_bp[ (m_dim*v_idx) + i ] != ixyz[i] ) {
        return -4;
      }
    }

    grid_count[pos]--;

  }

  for (i=0; i<(int32_t)grid_count.size(); i++) {
    if (grid_count[i] != 0) { return -5; }
  }

  for (v_idx=0; v_idx < n_ele; v_idx++) {
    for (it = m_Ve_map[v_idx].begin(); it != m_Ve_map[v_idx].end(); ++it) {
      nei_idx = it->first;
      if ((nei_idx < 0) || (nei_idx >= n_ele)) { return -6; }
      if ( m_Ve_map[nei_idx].count(v_idx) == 0 ) { return -7; }
    }
  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::p2grid_ixyz( int64_t *ixyz, double *p ) {

  if (m_dim == 3) {
    ixyz[0] = (int64_t)floor( ((double)m_grid_n) * p[0] );
    ixyz[1] = (int64_t)floor( ((double)m_grid_n) * p[1] );
    ixyz[2] = (int64_t)floor( ((double)m_grid_n) * p[2] );
    return 0;
  }

  else if (m_dim == 2) {
    ixyz[0] = (int64_t)floor( ((double)m_grid_n) * p[0] );
    ixyz[1] = (int64_t)floor( ((double)m_grid_n) * p[1] );
    return 0;
  }

  return -1;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::oob(double *v) {
  if (v[0] <  m_bbox[0][0]) { return 1; }
  if (v[0] >= m_bbox[1][0]) { return 1; }

  if (v[1] <  m_bbox[0][1]) { return 1; }
  if (v[1] >= m_bbox[1][1]) { return 1; }

  if (m_dim == 3) {
    if (v[2] <  m_bbox[0][2]) { return 1; }
    if (v[2] >= m_bbox[1][2]) { return 1; }
  }

  return 0;
}

int64_t RELATIVE_NEIGHBORHOOD_GRAPH::grid_ixyz2pos( int64_t *ixyz ) {
  int64_t pos=-1;
  pos = ((ixyz[2]*m_grid_n*m_grid_n) + (ixyz[1]*m_grid_n) + ixyz[0]);
  return pos;
}


int32_t RELATIVE_NEIGHBORHOOD_GRAPH::init() {
  int64_t i;
  int64_t n_ele = 0, v_idx, pos;
  int64_t grid_tot;
  int64_t ixyz[3] = {0};
  double n_d = 0.0;

  std::vector< int64_t > _em_v;

  std::map< int64_t, int64_t > _em;

  n_ele = (m_P.size() / m_dim);
  n_d = (double)n_ele;

  m_eps = SPOIF_RNG_EPS;

  m_bbox[0][0] = 0;
  m_bbox[0][1] = 0;
  m_bbox[0][2] = 0;

  m_bbox[1][0] = 1;
  m_bbox[1][1] = 1;
  m_bbox[1][2] = 1;

  m_grid_s = ((m_dim == 3) ? cbrt(n_d) : sqrt(n_d));
  m_grid_n = (int64_t)ceil(m_grid_s);
  m_ds = 1.0 / ((double)m_grid_n);

  m_grid_cell_size[0] = m_ds;
  m_grid_cell_size[1] = m_ds;
  m_grid_cell_size[2] = m_ds;


  m_Ve_map.clear();
  for (v_idx=0; v_idx < n_ele; v_idx++) {
    m_Ve_map.push_back( _em );
  }

  grid_tot = ( (m_dim == 3) ? (m_grid_n*m_grid_n*m_grid_n) : (m_grid_n*m_grid_n) );
  m_grid.clear();
  for (i=0; i<grid_tot; i++) {
    m_grid.push_back(_em_v);
  }

  for (v_idx=0; v_idx < n_ele; v_idx++) {
    p2grid_ixyz( ixyz, (&(m_P[0])) + (m_dim*v_idx) );
    pos = grid_ixyz2pos( ixyz );

    m_grid[pos].push_back( v_idx );
    m_P_idx_grid_bp.push_back( ixyz[0] );
    m_P_idx_grid_bp.push_back( ixyz[1] );
    if (m_dim == 3) {
      m_P_idx_grid_bp.push_back( ixyz[2] );
    }

  }

  m_fencePost_n = ((m_dim == 3) ? 9 : 3);

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::pointInit(std::vector< double > &pnt, int32_t dim) {
  int64_t i, j, n_ele=0, pos=0;

  if ((dim != 2) && (dim != 3)) { return -1; }
  m_dim = dim;

  m_P.clear();

  n_ele = (int64_t)(pnt.size() / m_dim);

  for (i=0; i < n_ele; i++) {
    for (j=0; j < m_dim; j++) {
      pos = (m_dim*(i)) + j;
      if (pos >= (int64_t)pnt.size()) { return -1; }

      m_P.push_back( pnt[pos] );
    }
  }

  return init();
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::poissonInit(int32_t n_point, int32_t dim) {
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

void RELATIVE_NEIGHBORHOOD_GRAPH::printP(FILE *ofp) {
  int64_t i, n_ele = 0;

  n_ele = (int64_t)(m_P.size()/m_dim);
  for (i=0; i < n_ele; i++) {
    if (m_dim == 2) {
      fprintf(ofp, "%f %f\n\n", m_P[(2*i) + 0], m_P[(2*i) + 1]);
    }
    else if (m_dim == 3) {
      fprintf(ofp, "%f %f %f\n\n", m_P[(3*i) + 0], m_P[(3*i) + 1], m_P[(3*i) + 2]);
    }
  }
}

void RELATIVE_NEIGHBORHOOD_GRAPH::printE(FILE *ofp) {
  int64_t v_idx, u_idx, n_ele, i;
  std::map< int64_t, int64_t >::iterator it;

  n_ele = (int64_t)(m_P.size() / m_dim);

  for (v_idx=0; v_idx < n_ele; v_idx++) {
    for (it = m_Ve_map[v_idx].begin(); it != m_Ve_map[v_idx].end(); ++it) {
      u_idx = it->first;

      if (u_idx < v_idx) { continue; }

      for (i=0; i<m_dim; i++) {
        fprintf(ofp, "%f%s",
            m_P[ (m_dim*v_idx) + i ],
            ((i==(m_dim-1)) ? "\n" : " ") );
      }

      for (i=0; i<m_dim; i++) {
        fprintf(ofp, "%f%s",
            m_P[ (m_dim*u_idx) + i ],
            ((i==(m_dim-1)) ? "\n\n\n" : " ") );
      }

    }
  }
}

//
int32_t RELATIVE_NEIGHBORHOOD_GRAPH::grid_sweep_perim_2d(std::vector< int64_t > &sweep_xy, double *p, int64_t ir) {
  int64_t grid_bbox[2][2] = {0},
          ipnt[2] = {0},
          mxy[2] = {0},
          Mxy[2] = {0};
  int64_t ix,iy;


  grid_bbox[0][0] = 0;
  grid_bbox[0][1] = 0;

  grid_bbox[1][0] = m_grid_n;
  grid_bbox[1][1] = m_grid_n;

  ipnt[0] = (int64_t)floor( p[0] / m_grid_cell_size[0] );
  ipnt[1] = (int64_t)floor( p[1] / m_grid_cell_size[1] );

  mxy[0] = ipnt[0] - ir;
  mxy[1] = ipnt[1] - ir;

  Mxy[0] = ipnt[0] + ir+1;
  Mxy[1] = ipnt[1] + ir+1;

  sweep_xy.clear();

  for (ix=mxy[0]; ix < Mxy[0]; ix++) {

    if ( (ix >= grid_bbox[0][0]) &&
         (ix <  grid_bbox[1][0]) &&
         (mxy[1] >= grid_bbox[0][1]) &&
         (mxy[1] <  grid_bbox[1][1]) ) {
      sweep_xy.push_back( ix );
      sweep_xy.push_back( mxy[1] );
    }

    if (mxy[1] == (Mxy[1]-1)) { continue; }

    if ( (ix >= grid_bbox[0][0]) &&
         (ix <  grid_bbox[1][0]) &&
         ((Mxy[1]-1) >= grid_bbox[0][1]) &&
         ((Mxy[1]-1) <  grid_bbox[1][1]) ) {
      sweep_xy.push_back( ix );
      sweep_xy.push_back( Mxy[1]-1 );
    }

  }

  for (iy=(mxy[1]+1); iy < (Mxy[1]-1); iy++) {
    if ( (mxy[0] >= grid_bbox[0][0]) &&
         (mxy[1] <  grid_bbox[1][0]) &&
         (iy >= grid_bbox[0][1]) &&
         (iy <  grid_bbox[1][1]) ) {
      sweep_xy.push_back( mxy[0] );
      sweep_xy.push_back( iy );
    }

    if (mxy[0] == (Mxy[0]-1)) { continue; }

    if ( ((Mxy[0]-1) >= grid_bbox[0][0]) &&
         ((Mxy[0]-1) <  grid_bbox[1][0]) &&
         (iy >= grid_bbox[0][1]) &&
         (iy <  grid_bbox[1][1]) ) {
      sweep_xy.push_back( Mxy[0]-1 );
      sweep_xy.push_back( iy );
    }
  }

  return 0;
}

int RELATIVE_NEIGHBORHOOD_GRAPH::oobixyz(int64_t ix, int64_t iy, int64_t iz, int64_t bb[][3]) {
  if (ix <  bb[0][0]) { return 1; }
  if (ix >= bb[1][0]) { return 1; }

  if (iy <  bb[0][1]) { return 1; }
  if (iy >= bb[1][1]) { return 1; }

  if (iz <  bb[0][2]) { return 1; }
  if (iz >= bb[1][2]) { return 1; }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::grid_sweep_perim_3d(std::vector< int64_t > &sweep_xyz, double *p, int64_t ir) {
  int64_t grid_bbox[2][3] = {0},
          ipnt[3] = {0},
          mxyz[3] = {0},
          Mxyz[3] = {0};
  int64_t ix,iy,iz;

  grid_bbox[0][0] = 0;
  grid_bbox[0][1] = 0;
  grid_bbox[0][2] = 0;

  grid_bbox[1][0] = m_grid_n;
  grid_bbox[1][1] = m_grid_n;
  grid_bbox[1][2] = m_grid_n;

  ipnt[0] = (int64_t)floor( p[0] / m_grid_cell_size[0] );
  ipnt[1] = (int64_t)floor( p[1] / m_grid_cell_size[1] );
  ipnt[2] = (int64_t)floor( p[2] / m_grid_cell_size[2] );

  mxyz[0] = ipnt[0] - ir;
  mxyz[1] = ipnt[1] - ir;
  mxyz[2] = ipnt[2] - ir;

  Mxyz[0] = ipnt[0] + ir+1;
  Mxyz[1] = ipnt[1] + ir+1;
  Mxyz[2] = ipnt[2] + ir+1;

  sweep_xyz.clear();

  for (ix=mxyz[0]; ix<Mxyz[0]; ix++) { 
    for (iy=mxyz[1]; iy<Mxyz[1]; iy++) {   

      if (oobixyz(ix, iy, mxyz[2], grid_bbox) == 0) {
        sweep_xyz.push_back( ix );
        sweep_xyz.push_back( iy );
        sweep_xyz.push_back( mxyz[2] );
      }
      if (mxyz[2] == (Mxyz[2]-1)) { continue; }
      if (oobixyz(ix,iy,Mxyz[2]-1, grid_bbox) == 0) {
        sweep_xyz.push_back(ix);
        sweep_xyz.push_back(iy);
        sweep_xyz.push_back(Mxyz[2]-1);
      }
    }
  }

  for (iy=mxyz[1]; iy<Mxyz[1]; iy++) {
    for (iz=(mxyz[2]+1); iz<(Mxyz[2]-1); iz++) {
      if (oobixyz(mxyz[0], iy, iz, grid_bbox) == 0) {
        sweep_xyz.push_back(mxyz[0]);
        sweep_xyz.push_back(iy);
        sweep_xyz.push_back(iz);
      }
      if (mxyz[0] == (Mxyz[0]-1)) { continue; }
      if (oobixyz(Mxyz[0]-1, iy, iz, grid_bbox) == 0) {
        sweep_xyz.push_back(Mxyz[0]-1);
        sweep_xyz.push_back(iy);
        sweep_xyz.push_back(iz);
      }
    }
  }

  for (ix=(mxyz[0]+1); ix<(Mxyz[0]-1); ix++) { 
    for (iz=(mxyz[2]+1); iz<(Mxyz[2]-1); iz++) {
      if (oobixyz(ix, mxyz[1], iz, grid_bbox) == 0) {
        sweep_xyz.push_back(ix);
        sweep_xyz.push_back(mxyz[1]);
        sweep_xyz.push_back(iz);
      }
      if (mxyz[1] == (Mxyz[1]-1)) { continue; }
      if (oobixyz(ix, Mxyz[1]-1, iz, grid_bbox) == 0) {
        sweep_xyz.push_back(ix);
        sweep_xyz.push_back(Mxyz[1]-1);
        sweep_xyz.push_back(iz);
      }
    }
  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::in_lune_2d(double *a, double *b, double *c) {
  double  dist_ca,
          dist_cb,
          dist_ab;

  dist_ca = sqrt( ((c[0]-a[0])*(c[0]-a[0])) + ((c[1]-a[1])*(c[1]-a[1])) );
  dist_cb = sqrt( ((c[0]-b[0])*(c[0]-b[0])) + ((c[1]-b[1])*(c[1]-b[1])) );
  dist_ab = sqrt( ((a[0]-b[0])*(a[0]-b[0])) + ((a[1]-b[1])*(a[1]-b[1])) );

  if ((dist_ca <= dist_ab) &&
      (dist_cb <= dist_ab)) {
    return 1;
  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::in_lune_3d(double *a, double *b, double *c) {
  double  dist2_ca,
          dist2_cb,
          dist2_ab;

  dist2_ca = ( ((c[0]-a[0])*(c[0]-a[0])) + ((c[1]-a[1])*(c[1]-a[1])) + ((c[2]-a[2])*(c[2]-a[2])) );
  dist2_cb = ( ((c[0]-b[0])*(c[0]-b[0])) + ((c[1]-b[1])*(c[1]-b[1])) + ((c[2]-b[2])*(c[2]-b[2])) );
  dist2_ab = ( ((a[0]-b[0])*(a[0]-b[0])) + ((a[1]-b[1])*(a[1]-b[1])) + ((a[2]-b[2])*(a[2]-b[2])) );

  if ((dist2_ca <= dist2_ab) &&
      (dist2_cb <= dist2_ab)) {
    return 1;
  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::in_lune_Nd(double *a, double *b, double *c, int32_t D) {
  int32_t i;
  double  dist2_ca = 0.0,
          dist2_cb = 0.0,
          dist2_ab = 0.0;

  for (i=0; i<D; i++) {
    dist2_ca += (c[i] - a[i])*(c[i] - a[i]);
    dist2_cb += (c[i] - b[i])*(c[i] - b[i]);
    dist2_ab += (a[i] - b[i])*(a[i] - b[i]);
  }

  if ((dist2_ca <= dist2_ab) &&
      (dist2_cb <= dist2_ab)) {
    return 1;
  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::RNG_naive(void) {
  int64_t u_idx, v_idx, w_idx, n_ele;
  int is_conn = 0;

  n_ele = (int64_t)(m_P.size()/m_dim);

  for (u_idx=0; u_idx < n_ele; u_idx++) {
    m_Ve_map[u_idx].clear();
  }

  for (u_idx=0; u_idx < n_ele; u_idx++) {
    for (v_idx=0; v_idx < n_ele; v_idx++) {
      if (u_idx == v_idx) { continue; }

      is_conn = 1;

      for (w_idx=0; w_idx < n_ele; w_idx++) {
        if ((w_idx == u_idx) || (w_idx == v_idx)) { continue; }

        if (m_dim == 3) {
          if (in_lune_3d( &(m_P[3*u_idx]), &(m_P[3*v_idx]), &(m_P[3*w_idx]) )) {
            is_conn = 0;
            break;
          }
        }
        else if (m_dim == 2) {
          if (in_lune_2d( &(m_P[2*u_idx]), &(m_P[2*v_idx]), &(m_P[2*w_idx]) )) {
            is_conn = 0;
            break;
          }
        }
        else { return -1; }
      }

      if (is_conn) {
        m_Ve_map[u_idx][v_idx] = 1;
        m_Ve_map[v_idx][u_idx] = 1;
      }
    }

  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::RNGv_fence(int64_t p_idx, std::vector< int64_t > &q_sched, std::vector< int64_t > &q_saboteur) {
  int64_t sqi = 0, sqj=0,
          q_idx = -1,
          u_idx = -1;
  int _found = 0;


  for (sqi=0; sqi < (int64_t)q_sched.size(); sqi++) {
    q_idx = q_sched[sqi];
    _found = 1;

    if (m_profile_level > 0) { _prof_s( m_prof, "RNGv_fence.p_edge"); }

    for (sqj=0; sqj < (int64_t)q_sched.size(); sqj++) {
      if (sqi == sqj) { continue; }
      u_idx = q_sched[sqj];

      if (m_dim == 3) {
        if (in_lune_3d( &(m_P[3*p_idx]), &(m_P[3*q_idx]), &(m_P[3*u_idx]) )) {
          _found = 0;
          break;
        }
      }
      else if (m_dim == 2) {
        if (in_lune_2d( &(m_P[2*p_idx]), &(m_P[2*q_idx]), &(m_P[2*u_idx]) )) {
          _found = 0;
          break;
        }
      }
      else { return -1; }
    }

    if (m_profile_level > 0) { _prof_e( m_prof, "RNGv_fence.p_edge"); }

    if (_found) {

      if (m_profile_level > 0) { _prof_s( m_prof, "RNGv_fence.sabotage"); }

      for (sqj=0; sqj < (int64_t)q_saboteur.size(); sqj++) {
        if (sqi == sqj) { continue; }
        u_idx = q_saboteur[sqj];

        if (m_dim == 3) {
          if (in_lune_3d( &(m_P[3*p_idx]), &(m_P[3*q_idx]), &(m_P[3*u_idx]) )) {
            _found = 0;
            break;
          }
        }
        else if (m_dim == 2) {
          if (in_lune_2d( &(m_P[2*p_idx]), &(m_P[2*q_idx]), &(m_P[2*u_idx]) )) {
            _found = 0;
            break;
          }
        }

      }

      if (m_profile_level > 0) {
        _prof_e( m_prof, "RNGv_fence.sabotage");
        _prof_s( m_prof, "RNGv_fence.ve_map");
      }

      if (_found) {
        m_Ve_map[p_idx][q_idx] = 1;
        m_Ve_map[q_idx][p_idx] = 1;
      }

      if (m_profile_level > 0) { _prof_e( m_prof, "RNGv_fence.ve_map"); }

    }

  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::RNGv_fence_opt1(int64_t p_idx, std::vector< int64_t > &q_sched, std::vector< i64_d_t > &q_sabo_dist) {
  double p[3] = {0},
         q[3] = {0};
  int64_t i,
          sqi = 0,
          sqj=0,
          q_idx = -1,
          u_idx = -1,
          bp=0,bq=0,bu=0;
  int _found = 0;

  double S2 = -1.0,
         dist_pq = -1.0,
         dist_pu = -1.0;

  i64_d_t *u_idt;

  bp = m_dim*p_idx;

  for (sqi=0; sqi < (int64_t)q_sched.size(); sqi++) {
    q_idx = q_sched[sqi];
    bq = m_dim*q_idx;
    _found = 1;

    for (sqj=0; sqj < (int64_t)q_sched.size(); sqj++) {
      if (sqi == sqj) { continue; }

      u_idx = q_sched[sqj];
      bu = m_dim*u_idx;

      if (in_lune_Nd( &(m_P[bp]), &(m_P[bq]), &(m_P[bu]), m_dim)) {
        _found = 0;
        break;
      }

    }

    if (_found) {

      S2 = 0.0;
      for (i=0; i<m_dim; i++) {
        p[i] = m_P[ bp + i ];
        q[i] = m_P[ bq + i ];
        S2 += (p[i] - q[i])*(p[i] - q[i]);
      }
      dist_pq = sqrt(S2);

      for (sqj=0; sqj < (int64_t)q_sabo_dist.size(); sqj++) {
        if (sqi == sqj) { continue; }

        u_idt = &(q_sabo_dist[sqj]);

        u_idx   = u_idt->i;
        dist_pu = u_idt->d;
        bu = m_dim*u_idx;

        // |p-q| can be though of as the radius of sphere centered at p
        // with q on the boundary.
        // if |p-u| > |p-q|, that means u is totally outside the |p-q| sphere
        // centered at p, so can't be inside the lune.
        //
        if (dist_pq < dist_pu) { break; }

        if (in_lune_Nd( &(m_P[bp]), &(m_P[bq]), &(m_P[bu]), m_dim)) {
          _found = 0;
          break;
        }

      }

      if (_found) {
        m_Ve_map[p_idx][q_idx] = 1;
        m_Ve_map[q_idx][p_idx] = 1;
      }

    }

  }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::RNGv_naive(int64_t p_idx, std::vector< int64_t > &q_sched) {
  int64_t sqi = 0, sqj=0,
          q_idx = -1,
          u_idx = -1;
  int _found = 0;

  for (sqi=0; sqi < (int64_t)q_sched.size(); sqi++) {
    q_idx = q_sched[sqi];
    _found = 1;

    for (sqj=0; sqj < (int64_t)q_sched.size(); sqj++) {
      if (sqi == sqj) { continue; }
      u_idx = q_sched[sqj];

      if (m_dim == 3) {
        if (in_lune_3d( &(m_P[3*p_idx]), &(m_P[3*q_idx]), &(m_P[3*u_idx]) )) {
          _found = 0;
          break;
        }
      }
      else if (m_dim == 2) {
        if (in_lune_2d( &(m_P[2*p_idx]), &(m_P[2*q_idx]), &(m_P[2*u_idx]) )) {
          _found = 0;
          break;
        }
      }
      else { return -1; }
    }

    if (_found) {
      m_Ve_map[p_idx][q_idx] = 1;
      m_Ve_map[q_idx][p_idx] = 1;
    }

  }

  return 0;
}

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
int32_t RELATIVE_NEIGHBORHOOD_GRAPH::SPoIF_2d_v(int64_t p_idx) {
  int32_t res = 0;

  int64_t n_cluster = 2,
          cluster_size = 2,
          n_idir = 4;

  int64_t i,j,
          ir=0,
          fpi=0, fpci=0,
          sqi=-1,
          cluster_idx=0,
          idir=0,
          grid_pos = -1,
          bin_idx=-1;

  int32_t fencePostSecure[4][3];
  int64_t n_fp_secure= 0,
          n_fp_max = 4*3;
  int32_t fps_cache[4][3];
  int64_t n_cluster_secure = 0;


  int64_t cell_origin[2] = {0};

  //int64_t ip[2];
  double win_center[2] = {0},
         //Wp[2] = {0},
         p[2] = {0},
         q[2] = {0},
         dq[2] = {0},
         dqp[2] = {0},
         Nqp[2] = {0},
         v[3] = {0},
         fpv[2] = {0};

  double _l2 = 0.0,
         s = 0.0;
  int64_t q_idx = -1,
          q_idir_oppo = -1,
          path_idx = -1,
          fpsi = -1,
          ixy[2];

  int32_t _ns = 0,
          _ns_max = 0;

  //int64_t _i, _j, _k;
  //int _debug = 0;

  static std::vector< int64_t > sweep;
  static std::vector< int64_t > q_sched,
                                saboteur_list;
  double max_dist = 0.0, _d = -1.0;
  int64_t max_ir=0;

  sweep.clear();
  q_sched.clear();
  saboteur_list.clear();

  p[0] = m_P[(m_dim*p_idx) + 0];
  p[1] = m_P[(m_dim*p_idx) + 1];

  //Wp[0] = p[0] * m_grid_n;
  //Wp[1] = p[1] * m_grid_n;

  //ip[0] = (int64_t)floor( Wp[0] );
  //ip[1] = (int64_t)floor( Wp[1] );

  for (idir=0; idir<n_idir; idir++) {
    for (fpi=0; fpi < m_fencePost_n; fpi++) {
      fencePostSecure[idir][fpi] = 0;
    }
  }

  grid_sweep_perim_2d(sweep, p, 0);
  cell_origin[0] = sweep[0];
  cell_origin[1] = sweep[1];

  win_center[0] = (m_ds/2.0) + (m_ds*cell_origin[0]);
  win_center[1] = (m_ds/2.0) + (m_ds*cell_origin[1]);

  if (m_profile_level > 0) { _prof_s( m_prof, "spoif2d_v.ir"); }

  // For each grid integer radius (ir), centered at p (m_P[p_idx]),
  // enumerate the grid cells on the ir shell and collect all vertices
  // in them.
  // If the grid shell side is out of bounds, mark the fence posts
  // as secured on that side.
  // Otherwise, go through all collected vertices to see if they
  // secure the posts within the fence.
  // If so, collect potential saboteurs from grid positions bounded
  // by the maximum distance of p to its neighbors and run a naive
  // RNG to determine relative neighborhood graph.
  //
  // Initial grid radius is taken to be ir=3, collecting neighbor
  // points as we go, as likelyhood is low that anything below
  // ir=3 will secure the fence (pre-processing batch speedup).
  //
  for (ir=0; ir < m_grid_n; ir++) {

    if (m_profile_level > 0) { _prof_s( m_prof, "spoif2d_v.ir.sweep0"); }

    grid_sweep_perim_2d(sweep, p, ir);

    if (m_profile_level > 0) {
      _prof_e( m_prof, "spoif2d_v.ir.sweep0");
      _prof_s( m_prof, "spoif2d_v.ir.oob_secure");
    }

    // initial OOB fencepost marking
    //
    for (idir=0; idir < n_idir; idir++) {
      for (cluster_idx=0; cluster_idx < n_cluster; cluster_idx++) {

        n_cluster_secure = 0;
        for (fpci=0; fpci < cluster_size; fpci++) {
          fpi = m_fencePostCluster[cluster_idx][fpci];

          v[0] = 0.0;
          v[1] = 0.0;

          if (ir <= m_fpR_max_ir) {
            v[0] = win_center[0] + m_fpR_v[ir][idir][(m_dim*fpi) + 0];
            v[1] = win_center[1] + m_fpR_v[ir][idir][(m_dim*fpi) + 1];
          }
          else {
            v[0] = win_center[0] + (m_ds * ((2.0*ir)+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 0]);
            v[1] = win_center[1] + (m_ds * ((2.0*ir)+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 1]);
          }

          if (oob(v)) { n_cluster_secure++; }
        }

        if (n_cluster_secure == cluster_size) {
          for (fpci=0; fpci < cluster_size; fpci++) {
            fpi = m_fencePostCluster[ cluster_idx ][ fpci ];
            if (fencePostSecure[ idir ][ fpi ] == 0) { n_fp_secure++; }
            fencePostSecure[ idir ][ fpi ] = 1;
          }
        }

      }
    }

    if (m_profile_level > 0) { _prof_e( m_prof, "spoif2d_v.ir.oob_secure"); }

    if (m_profile_level > 0) { _prof_s( m_prof, "spoif2d_v.ir.q_sched+"); }

    for (path_idx=0; path_idx < (int64_t)sweep.size(); path_idx += m_dim) {
      ixy[0] = sweep[ path_idx + 0 ];
      ixy[1] = sweep[ path_idx + 1 ];

      grid_pos = (ixy[1]*m_grid_n) + ixy[0];
      for (bin_idx=0; bin_idx < (int64_t)m_grid[grid_pos].size(); bin_idx++) {
        q_idx = m_grid[grid_pos][bin_idx];
        if (q_idx == p_idx) { continue; }

        q_sched.push_back( q_idx );

        q[0] = m_P[(m_dim*q_idx) + 0];
        q[1] = m_P[(m_dim*q_idx) + 1];
        _d = sqrt( ((q[0]-p[0])*(q[0]-p[0])) + ((q[1]-p[1])*(q[1]-p[1])) );
        if (_d > max_dist) { max_dist = _d; }
      }
    }

    // we do the OOB fencepost check after to make sure we've collected
    // all points in our current grid sweep boundary.
    //
    if (n_fp_secure == n_fp_max) { break; }

    if (m_profile_level > 0) { _prof_e( m_prof, "spoif2d_v.ir.q_sched+"); }

    // median is ir == 3, so collect lower than ir but otherwise
    // skip secure computation until we get to ir == 3
    // (worth ~15% speed increase)
    //
    if (ir < 2) { continue; }

    if (m_profile_level > 0) { _prof_s( m_prof, "spoif2d_v.ir.secure"); }

    // for each neighbor, q, within the current fence,
    // take the normal plane centered at p with normal (q-p)/|q-p|
    // to see if it secures a cluster of fence posts on the
    // current fence edge.
    // If all fence posts secured, we can do a RNG calculation.
    //
    for (sqi=0; sqi < (int64_t)q_sched.size(); sqi++) {
      q_idx = q_sched[sqi];

      q[0] = m_P[(m_dim*q_idx) + 0];
      q[1] = m_P[(m_dim*q_idx) + 1];

      dq[0] = q[0] - win_center[0];
      dq[1] = q[1] - win_center[1];

      dqp[0] = q[0] - p[0];
      dqp[1] = q[1] - p[1];

      _l2 = sqrt( (dqp[0]*dqp[0]) + (dqp[1]*dqp[1]) );
      Nqp[0] = (1.0/_l2) * dqp[0];
      Nqp[1] = (1.0/_l2) * dqp[1];

      q_idir_oppo = m_idir_oppo[ _v2idir(Nqp, 2) ];

      for (i=0; i<n_idir; i++) {
        for (j=0; j < 3; j++) { fps_cache[i][j] = 0; }
      }

      for (idir=0; idir < n_idir; idir++) {

        if (q_idir_oppo == idir) { continue; }

        for (cluster_idx=0; cluster_idx < n_cluster; cluster_idx++) {

          n_cluster_secure = 0;

          for (fpci=0; fpci < cluster_size; fpci++) {
            fpi = m_fencePostCluster[cluster_idx][fpci];

            if (fps_cache[idir][fpi] == 1) {
              n_cluster_secure++;
              continue;
            }

            fpv[0] = 0; fpv[1] = 0;

            if (ir <= m_fpR_max_ir) {
              fpv[0] = m_fpR_v[ir][idir][(m_dim*fpi) + 0];
              fpv[1] = m_fpR_v[ir][idir][(m_dim*fpi) + 1];
            }
            else {
              fpv[0] = (m_ds * ((2.0*((double)ir))+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 0]);
              fpv[1] = (m_ds * ((2.0*((double)ir))+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 1]);
            }

            s = (Nqp[0]*(fpv[0]-dq[0])) + (Nqp[1]*(fpv[1]-dq[1]));
            if (s > 0) {
              fps_cache[idir][fpi] = 1;
              n_cluster_secure++;
            }
          }

          if (n_cluster_secure == n_cluster) {
            for (fpci=0; fpci < cluster_size; fpci++) {
              fpi = m_fencePostCluster[cluster_idx][fpci];
              if (fencePostSecure[idir][fpi] == 0) { n_fp_secure++; }
              fencePostSecure[idir][fpi] = 1;
            }
          }

          if (n_fp_secure == n_fp_max) { break; }
        }

        if (n_fp_secure == n_fp_max) { break; }
      }

      if (n_fp_secure == n_fp_max) { break; }
    }

    if (m_profile_level > 0) { _prof_e( m_prof, "spoif2d_v.ir.secure"); }

    if (n_fp_secure == n_fp_max) { break; }

    _ns = 0; _ns_max = 0;
    for (idir=0; idir < n_idir; idir++) {
      for (fpsi=0; fpsi < m_fencePost_n; fpsi++) {
        _ns += fencePostSecure[idir][fpsi];
        _ns_max++;
      }
    }

    if (_ns == _ns_max) { break; }
  }

  if (m_profile_level > 0) {
    _prof_e( m_prof, "spoif2d_v.ir");
    _prof_s( m_prof, "spoif2d_v.sabo");
  }

  // create saboteur list to make sure that if there's a phantom edge
  // within the fence it'll be sabotaged from a point in the saboteur list.
  //
  max_ir = (int64_t)ceil( (max_dist / m_ds) + 0.5 );

  for (ir=(ir+1); ir <= max_ir; ir++) {
    grid_sweep_perim_2d(sweep, p, ir);

    for (path_idx=0; path_idx < (int64_t)sweep.size(); path_idx += m_dim) {
      ixy[0] = sweep[ path_idx + 0 ];
      ixy[1] = sweep[ path_idx + 1 ];

      grid_pos = (ixy[1]*m_grid_n) + ixy[0];
      for (bin_idx=0; bin_idx < (int64_t)m_grid[grid_pos].size(); bin_idx++) {
        q_idx = m_grid[grid_pos][bin_idx];
        if (q_idx == p_idx) { continue; }

        saboteur_list.push_back( q_idx );
      }
    }

  }

  if (m_profile_level > 0) {
    _prof_e( m_prof, "spoif2d_v.sabo");
    _prof_s( m_prof, "spoif2d_v.fence");
  }

  res = RNGv_fence(p_idx, q_sched, saboteur_list);

  if (m_profile_level > 0) { _prof_e( m_prof, "spoif2d_v.fence"); }

  return res;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::SPoIF_2d() {
  //int res=0;
  int64_t n_idir = -1;
  int64_t ir, idir, fpi;
  double fpv[2] = {0};

  int64_t p_idx = -1, n_ele = 0;

  double fL = 1.0 / 2.0;

  n_idir = m_dim*2;

  if (m_profile_level > 0) { _prof_s( m_prof, "spoif2d.tot"); }

  // m_fencePost_v holds fence posts on the cube for the relevant dimension
  // m_fencePostCluster holds the grouping of the fenceposts
  //   - plane tests see if they completely obscure a group which, if so,
  //     means we can mark those fence posts as secured
  //
  // m_fpR_v are precomputed fenceposts for
  //   grid radius 0 to m_fpR_max_ir (inclusive) (e.g. 3)
  //
  m_fencePost_v[0][(2*0) + 0] =  fL; m_fencePost_v[0][(2*0) + 1] = -fL;
  m_fencePost_v[0][(2*1) + 0] =  fL; m_fencePost_v[0][(2*1) + 1] =   0;
  m_fencePost_v[0][(2*2) + 0] =  fL; m_fencePost_v[0][(2*2) + 1] =  fL;

  m_fencePost_v[1][(2*0) + 0] = -fL; m_fencePost_v[1][(2*0) + 1] = -fL;
  m_fencePost_v[1][(2*1) + 0] = -fL; m_fencePost_v[1][(2*1) + 1] =   0;
  m_fencePost_v[1][(2*2) + 0] = -fL; m_fencePost_v[1][(2*2) + 1] =  fL;

  m_fencePost_v[2][(2*0) + 0] = -fL; m_fencePost_v[2][(2*0) + 1] =  fL;
  m_fencePost_v[2][(2*1) + 0] =   0; m_fencePost_v[2][(2*1) + 1] =  fL;
  m_fencePost_v[2][(2*2) + 0] =  fL; m_fencePost_v[2][(2*2) + 1] =  fL;

  m_fencePost_v[3][(2*0) + 0] = -fL; m_fencePost_v[3][(2*0) + 1] = -fL;
  m_fencePost_v[3][(2*1) + 0] =   0; m_fencePost_v[3][(2*1) + 1] = -fL;
  m_fencePost_v[3][(2*2) + 0] =  fL; m_fencePost_v[3][(2*2) + 1] = -fL;

  m_fencePostCluster[0][0] = 0; m_fencePostCluster[0][1] = 1;

  m_fencePostCluster[1][0] = 1; m_fencePostCluster[1][1] = 2;

  // cache fencepost calculatiosn
  //
  for (ir=0; ir <= m_fpR_max_ir; ir++) {
    for (idir=0; idir < n_idir; idir++) {
      for (fpi=0; fpi < m_fencePost_n; fpi++) {

        fpv[0] = m_ds*((2.0*((double)ir)) + 1.0) * m_fencePost_v[idir][(2*fpi) + 0];
        fpv[1] = m_ds*((2.0*((double)ir)) + 1.0) * m_fencePost_v[idir][(2*fpi) + 1];

        m_fpR_v[ir][idir][(2*fpi) + 0] = fpv[0];
        m_fpR_v[ir][idir][(2*fpi) + 1] = fpv[1];
      }
    }
  }

  // init done, calculate each RNG for each vertex
  //
  n_ele = (int64_t)(m_P.size() / m_dim);
  for (p_idx=0; p_idx < n_ele; p_idx++) {
    SPoIF_2d_v( p_idx );
  }

  if (m_profile_level > 0) { _prof_e( m_prof, "spoif2d.tot"); }


  if ((m_profile_level > 0) && (m_verbose > 0)) { _prof_print( m_prof ); }

  return 0;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::SPoIF_3d_v(int64_t p_idx) {
  int32_t res = 0;

  int64_t n_cluster = 4,
          cluster_size = 4,
          n_idir = -1;

  int64_t i,j,
          ir=0,
          fpi=0, fpci=0,
          sqi=-1,
          cluster_idx=0,
          idir=0,
          grid_pos = -1,
          bin_idx=-1;

  int32_t fencePostSecure[6][9];
  int64_t n_fp_secure= 0,
          n_fp_max = 6*3*3;
  int32_t fps_cache[6][9];
  int64_t n_cluster_secure = 0;

  std::vector< int64_t > sweep;

  int64_t cell_origin[3] = {0};

  //int64_t ip[3];
  double win_center[3] = {0},
         //Wp[3] = {0},
         p[3] = {0},
         q[3] = {0},
         dq[3] = {0},
         dqp[3] = {0},
         Nqp[3] = {0},
         v[3] = {0},
         fpv[3] = {0};

  double _l2 = 0.0,
         s = 0.0;
  int64_t q_idx = -1,
          q_idir_oppo = -1,
          path_idx = -1,
          fpsi = -1,
          ixyz[3];

  int32_t _ns = 0,
          _ns_max = 0;

  //int64_t _i, _j, _k;

  n_idir = 2*m_dim;

  std::vector< int64_t > q_sched,
                         saboteur_list;
  double max_dist = 0.0, _d = -1.0;
  int64_t max_ir=0;


  p[0] = m_P[(m_dim*p_idx) + 0];
  p[1] = m_P[(m_dim*p_idx) + 1];
  p[2] = m_P[(m_dim*p_idx) + 2];

  //Wp[0] = p[0] * m_grid_n;
  //Wp[1] = p[1] * m_grid_n;
  //Wp[2] = p[2] * m_grid_n;

  //ip[0] = (int64_t)floor( Wp[0] );
  //ip[1] = (int64_t)floor( Wp[1] );
  //ip[2] = (int64_t)floor( Wp[2] );

  for (idir=0; idir<n_idir; idir++) {
    for (fpi=0; fpi < m_fencePost_n; fpi++) {
      fencePostSecure[idir][fpi] = 0;
    }
  }

  grid_sweep_perim_3d(sweep, p, 0);
  cell_origin[0] = sweep[0];
  cell_origin[1] = sweep[1];
  cell_origin[2] = sweep[2];

  win_center[0] = (m_ds/2.0) + (m_ds*cell_origin[0]);
  win_center[1] = (m_ds/2.0) + (m_ds*cell_origin[1]);
  win_center[2] = (m_ds/2.0) + (m_ds*cell_origin[2]);

  for (ir=0; ir < m_grid_n; ir++) {
    grid_sweep_perim_3d(sweep, p, ir);

    for (idir=0; idir < n_idir; idir++) {
      for (cluster_idx=0; cluster_idx < n_cluster; cluster_idx++) {

        n_cluster_secure = 0;
        for (fpci=0; fpci < cluster_size; fpci++) {
          fpi = m_fencePostCluster[cluster_idx][fpci];

          v[0] = 0.0;
          v[1] = 0.0;
          v[2] = 0.0;

          if (ir <= m_fpR_max_ir) {
            v[0] = win_center[0] + m_fpR_v[ir][idir][(m_dim*fpi) + 0];
            v[1] = win_center[1] + m_fpR_v[ir][idir][(m_dim*fpi) + 1];
            v[2] = win_center[2] + m_fpR_v[ir][idir][(m_dim*fpi) + 2];
          }
          else {
            v[0] = win_center[0] + (m_ds * ((2.0*ir)+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 0]);
            v[1] = win_center[1] + (m_ds * ((2.0*ir)+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 1]);
            v[2] = win_center[2] + (m_ds * ((2.0*ir)+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 2]);
          }

          if (oob(v)) { n_cluster_secure++; }
        }

        if (n_cluster_secure == cluster_size) {
          for (fpci=0; fpci < cluster_size; fpci++) {
            fpi = m_fencePostCluster[ cluster_idx ][ fpci ];
            if (fencePostSecure[ idir ][ fpi ] == 0) { n_fp_secure++; }
            fencePostSecure[ idir ][ fpi ] = 1;
          }
        }

      }
    }

    if (n_fp_secure == n_fp_max) { break; }

    for (path_idx=0; path_idx < (int64_t)sweep.size(); path_idx += m_dim) {
      ixyz[0] = sweep[ path_idx + 0 ];
      ixyz[1] = sweep[ path_idx + 1 ];
      ixyz[2] = sweep[ path_idx + 2 ];

      grid_pos = (ixyz[2]*m_grid_n*m_grid_n) + (ixyz[1]*m_grid_n) + ixyz[0];
      for (bin_idx=0; bin_idx < (int64_t)m_grid[grid_pos].size(); bin_idx++) {
        q_idx = m_grid[grid_pos][bin_idx];
        if (q_idx == p_idx) { continue; }

        q_sched.push_back( q_idx );

        q[0] = m_P[(m_dim*q_idx) + 0];
        q[1] = m_P[(m_dim*q_idx) + 1];
        q[2] = m_P[(m_dim*q_idx) + 2];
        _d = sqrt( ((q[0]-p[0])*(q[0]-p[0])) + ((q[1]-p[1])*(q[1]-p[1])) + ((q[2]-p[2])*(q[2]-p[2])) );
        if (_d > max_dist) { max_dist = _d; }

      }
    }

    // median is ir == 3, so collect lower than ir but otherwise
    // skip secure computation until we get to ir == 3
    // (worth ~15% speed increase)
    //
    if (ir < 2) { continue; }

    for (sqi=0; sqi < (int64_t)q_sched.size(); sqi++) {
      q_idx = q_sched[sqi];

      q[0] = m_P[(m_dim*q_idx) + 0];
      q[1] = m_P[(m_dim*q_idx) + 1];
      q[2] = m_P[(m_dim*q_idx) + 2];

      dq[0] = q[0] - win_center[0];
      dq[1] = q[1] - win_center[1];
      dq[2] = q[2] - win_center[2];

      dqp[0] = q[0] - p[0];
      dqp[1] = q[1] - p[1];
      dqp[2] = q[2] - p[2];

      _l2 = sqrt( (dqp[0]*dqp[0]) + (dqp[1]*dqp[1]) + (dqp[2]*dqp[2]) );
      Nqp[0] = (1.0/_l2) * dqp[0];
      Nqp[1] = (1.0/_l2) * dqp[1];
      Nqp[2] = (1.0/_l2) * dqp[2];

      q_idir_oppo = m_idir_oppo[ _v2idir(Nqp, 3) ];

      for (i=0; i<n_idir; i++) { for (j=0; j<9; j++) { fps_cache[i][j] = 0; } }

      for (idir=0; idir < n_idir; idir++) {

        if (q_idir_oppo == idir) { continue; }

        for (cluster_idx=0; cluster_idx < n_cluster; cluster_idx++) {

          n_cluster_secure = 0;

          for (fpci=0; fpci < cluster_size; fpci++) {
            fpi = m_fencePostCluster[cluster_idx][fpci];

            if (fps_cache[idir][fpi] == 1) {
              n_cluster_secure++;
              continue;
            }

            fpv[0] = 0; fpv[1] = 0; fpv[2] = 0;

            if (ir <= m_fpR_max_ir) {
              fpv[0] = m_fpR_v[ir][idir][(m_dim*fpi) + 0];
              fpv[1] = m_fpR_v[ir][idir][(m_dim*fpi) + 1];
              fpv[2] = m_fpR_v[ir][idir][(m_dim*fpi) + 2];
            }
            else {
              fpv[0] = (m_ds * ((2.0*((double)ir))+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 0]);
              fpv[1] = (m_ds * ((2.0*((double)ir))+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 1]);
              fpv[2] = (m_ds * ((2.0*((double)ir))+1.0) * m_fencePost_v[idir][(m_dim*fpi) + 2]);
            }

            s = (Nqp[0]*(fpv[0]-dq[0])) + (Nqp[1]*(fpv[1]-dq[1])) + (Nqp[2]*(fpv[2]-dq[2]));
            if (s > 0) {
              fps_cache[idir][fpi] = 1;
              n_cluster_secure++;
            }
          }

          if (n_cluster_secure == n_cluster) {
            for (fpci=0; fpci < cluster_size; fpci++) {
              fpi = m_fencePostCluster[cluster_idx][fpci];
              if (fencePostSecure[idir][fpi] == 0) { n_fp_secure++; }
              fencePostSecure[idir][fpi] = 1;
            }
          }

          if (n_fp_secure == n_fp_max) { break; }
        }

        if (n_fp_secure == n_fp_max) { break; }
      }

      if (n_fp_secure == n_fp_max) { break; }
    }

    if (n_fp_secure == n_fp_max) { break; }

    _ns = 0; _ns_max = 0;
    for (idir=0; idir < n_idir; idir++) {
      for (fpsi=0; fpsi < m_fencePost_n; fpsi++) {
        _ns += fencePostSecure[idir][fpsi];
        _ns_max++;
      }
    }

    if (_ns == _ns_max) { break; }
  }

  // create saboteur list to make sure that if there's a phantom edge
  // within the fence it'll be sabotaged from a point in the saboteur list.
  //
  max_ir = (int64_t)ceil( (max_dist / m_ds) + 0.5 );
  for (ir=ir+1; ir <= max_ir; ir++) {
    grid_sweep_perim_3d(sweep, p, ir);

    for (path_idx=0; path_idx < (int64_t)sweep.size(); path_idx += m_dim) {
      ixyz[0] = sweep[ path_idx + 0 ];
      ixyz[1] = sweep[ path_idx + 1 ];
      ixyz[2] = sweep[ path_idx + 2 ];

      grid_pos = (ixyz[2]*m_grid_n*m_grid_n) + (ixyz[1]*m_grid_n) + ixyz[0];
      for (bin_idx=0; bin_idx < (int64_t)m_grid[grid_pos].size(); bin_idx++) {
        q_idx = m_grid[grid_pos][bin_idx];
        if (q_idx == p_idx) { continue; }

        saboteur_list.push_back( q_idx );
      }
    }


  }

  res = RNGv_fence(p_idx, q_sched, saboteur_list);
  return res;
}

int32_t RELATIVE_NEIGHBORHOOD_GRAPH::SPoIF_3d() {
  //int res=0;
  int64_t n_idir = -1;
  int64_t i, j,
          ir, idir, fpi;
  double fpv[3] = {0};

  int64_t p_idx = -1, n_ele = 0;

  double fL = 1.0 / 2.0;

  double fpv_template[6][9][3] = {
    { { 1,-1,-1 }, { 1, 0,-1 }, { 1, 1,-1 },
      { 1,-1, 0 }, { 1, 0, 0 }, { 1, 1, 0 },
      { 1,-1, 1 }, { 1, 0, 1 }, { 1, 1, 1 } },
    { {-1,-1,-1 }, {-1, 0,-1 }, {-1, 1,-1 },
      {-1,-1, 0 }, {-1, 0, 0 }, {-1, 1, 0 },
      {-1,-1, 1 }, {-1, 0, 1 }, {-1, 1, 1 } },

    { {-1, 1,-1 }, {  0, 1,-1 }, { 1, 1,-1 },
      {-1, 1, 0 }, {  0, 1, 0 }, { 1, 1, 0 },
      {-1, 1, 1 }, {  0, 1, 1 }, { 1, 1, 1 } },
    { {-1,-1,-1 }, {  0,-1,-1 }, { 1,-1,-1 },
      {-1,-1, 0 }, {  0,-1, 0 }, { 1,-1, 0 },
      {-1,-1, 1 }, {  0,-1, 1 }, { 1,-1, 1 } },

    { {-1,-1, 1 }, {-1,  0, 1 }, {-1, 1, 1 },
      { 0,-1, 1 }, { 0,  0, 1 }, { 0, 1, 1 },
      { 1,-1, 1 }, { 1,  0, 1 }, { 1, 1, 1 } },
    { {-1,-1,-1 }, {-1,  0,-1 }, {-1, 1,-1 },
      { 0,-1,-1 }, { 0,  0,-1 }, { 0, 1,-1 },
      { 1,-1,-1 }, { 1,  0,-1 }, { 1, 1,-1 } }
  };

  int64_t _fpc_template[4][4] = { {0,1,3,4}, {1,2,4,5}, {3,4,6,7}, {4,5,7,8} };

  n_idir = m_dim*2;

  for (idir=0; idir < n_idir; idir++) {
    for (fpi=0; fpi < m_fencePost_n; fpi++) {
      for (i=0; i < m_dim; i++) {
        m_fencePost_v[idir][(m_dim*fpi) + i] = fL*fpv_template[idir][fpi][i];
      }
    }
  }

  // cache fencepost calculatiosn
  //
  for (ir=0; ir <= m_fpR_max_ir; ir++) {
    for (idir=0; idir < n_idir; idir++) {
      for (fpi=0; fpi < m_fencePost_n; fpi++) {

        fpv[0] = m_ds*((2.0*((double)ir)) + 1.0) * m_fencePost_v[idir][(m_dim*fpi) + 0];
        fpv[1] = m_ds*((2.0*((double)ir)) + 1.0) * m_fencePost_v[idir][(m_dim*fpi) + 1];
        fpv[1] = m_ds*((2.0*((double)ir)) + 1.0) * m_fencePost_v[idir][(m_dim*fpi) + 2];

        m_fpR_v[ir][idir][(m_dim*fpi) + 0] = fpv[0];
        m_fpR_v[ir][idir][(m_dim*fpi) + 1] = fpv[1];
        m_fpR_v[ir][idir][(m_dim*fpi) + 2] = fpv[2];
      }
    }
  }

  // fence post clusters, grouped in four
  //
  for (i=0; i<4; i++) {
    for (j=0; j<4; j++) {
      m_fencePostCluster[i][j] = _fpc_template[i][j];
    }
  }

  // init done, calculate each RNG for each vertex
  //
  n_ele = (int64_t)(m_P.size() / m_dim);
  for (p_idx=0; p_idx < n_ele; p_idx++) {
    SPoIF_3d_v( p_idx );
  }

  return 0;
}


