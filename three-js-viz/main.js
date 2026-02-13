// LICENSE: CC0
//
// To the extent possible under law, the person who associated CC0 with
// this project has waived all copyright and related or neighboring rights
// to this project.
// 
// You should have received a copy of the CC0 legalcode along with this
// work.  If not, see <http://creativecommons.org/publicdomain/zero/1.0/>.
//

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { TransformControls } from 'three/addons/controls/TransformControls.js';

import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';
import * as GeometryUtils from 'three/addons/utils/GeometryUtils.js';

import { FontLoader } from 'three/addons/loaders/FontLoader.js';

var g_data = {
};

export function simple_line(u,v,c, lw) {
  c = ((typeof c === "undefined") ? [Math.random(), Math.random(), Math.random() ] : c );
  lw = ((typeof lw === "undefined") ? 2 : lw);

  let matLine = new LineMaterial( {
    color: 0xffffff,
    linewidth: lw,
    vertexColors: true,
    dashed: false,
    alphaToCoverage: true
  } );


  let points = [];
  let colors = [];
  points.push( u[0], u[1], u[2] );
  points.push( v[0], v[1], v[2] );
  colors.push( c[0], c[1], c[2] );
  if (c.length >= 6) {
    colors.push( c[3], c[4], c[5] );
  }
  else {
    colors.push( c[0], c[1], c[2] );
  }

  let g = new LineGeometry();
  g.setPositions( points );
  g.setColors( colors );

  let l = new Line2( g, matLine );
  l.computeLineDistances();
  l.scale.set( 1, 1, 1 );
  scene.add( l );

  return l;
}

function _rnd(a,b) {
  if (typeof a === "undefined") { a=0; b=1; }
  else if (typeof b === "undefined") { b=a; a=0; }

  return (Math.random()*(b-a)) + a;
}

export function point_tmp() {
  let n_pnt = 30;


  let point = [];
  for (let i=0; i<n_pnt; i++) {
    let x = _rnd(-0.5,0.5);
    let y = _rnd(-0.5,0.5);
    let z = _rnd(-0.5,0.5);
    point.push([ x,y,z ]);
  }
  g_data["point"] = point;

  let grid_n = Math.ceil( Math.cbrt(n_pnt) );
  g_data["grid_n"] = grid_n;

  let pnt_geo = new THREE.BufferGeometry();
  let pnt_pos = new Float32Array( 3*point.length );
  let pnt_col = new Float32Array( 3*point.length );

  for (let i=0; i<point.length; i++) {
    pnt_pos[3*i + 0] = point[i][0];
    pnt_pos[3*i + 1] = point[i][1];
    pnt_pos[3*i + 2] = point[i][2];

    pnt_col[3*i + 0] = 1;
    pnt_col[3*i + 1] = 0.2;
    pnt_col[3*i + 2] = 0.2;
  }

  pnt_geo.setAttribute( 'position', new THREE.BufferAttribute( pnt_pos, 3 ) );
  pnt_geo.setAttribute( 'color', new THREE.BufferAttribute( pnt_col, 3 ) );
  pnt_geo.computeBoundingBox();

  let pnt_size = 1/64;
  let pnt_mat = new THREE.PointsMaterial( { "size": pnt_size, "vertexColors": true } );

  let pnt_three = new THREE.Points( pnt_geo, pnt_mat );
  scene.add(pnt_three);

  g_data["point_three"] = pnt_three;

}

export function conn_point() {
  let pnt = g_data.point;

  g_data["l"] = [];

  for (let it=0; it<20; it++) {
    let idx0 = Math.floor( Math.random() * pnt.length );
    let idx1 = Math.floor( Math.random() * pnt.length );

    let l = simple_line( pnt[idx0], pnt[idx1] );
    g_data.l.push(l);
  }
}



const renderer = new THREE.WebGLRenderer();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const controls = new OrbitControls( camera, renderer.domElement );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

camera.position.z = 5;

var g_ctx = {
  "scene": scene,
  "renderer": renderer,
  "camera": camera,
  "controls": controls
};


export function simple_rot_cube() {
  const geometry = new THREE.BoxGeometry( 1, 1, 1 );
  const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  const cube = new THREE.Mesh( geometry, material );

  g_data["cube"] = cube;
  g_ctx.scene.add( cube );
}


function animate() {
  g_ctx.renderer.render( scene, camera );

  if ("cube" in g_data) {
    g_data.cube.rotation.x += 0.01;
    g_data.cube.rotation.y += 0.01;
  }
}
renderer.setAnimationLoop( animate );


var g_f = {
  "simple_rot_cube": simple_rot_cube,
  "simple_line": simple_line,
  "conn_point": conn_point,
  "point_tmp": point_tmp
};

export { g_ctx as export_context, g_f as export_function, g_data as export_data  };
