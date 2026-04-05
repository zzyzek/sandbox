import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
//
//

var g_ctx = {
  "THREE": THREE,
  "scene": null,
  "camera": null,
  "renderer": null,

  "pass_render": null,
  "pass_bloom": null,
  "pass_output": null,

  "composer": null,

  "ambient_light": null,
  "directional_light": null,
  "directional_light1": null,
  "controls": null,

  "pos_idx": 0,
  "path": [],
  "tpath": [],

  "mesh": []
};


var PAL12 = [ 0xA80050, 0x00B1BA, 0x6278b1, 0xC9BA92, 0xA80050, 0x00B1BA, 0x6278b1, 0xC9BA92, 0xA80050, 0x00B1BA, 0x6278b1, 0xC9BA92 ];

function mk_colormap_f(_range, _pal) {
  return function(_t) {
    let _n = _range[ _range.length-1 ];
    let _tidx = Math.floor(_t*_n);

    for (let _i=1; _i<_range.length; _i++) {
      if ((_tidx >= _range[_i-1]) && (_tidx < _range[_i])) {
        return _pal[_i-1];
      }
    }
    return _pal[ _pal.length-1 ];
  };
}

function init() {

  let whd = BANNER_INFO.size;
  let n = whd[0]*whd[1]*whd[2];
  for (let i=0; i<n; i++) {
    g_ctx.path.push(-1);
    g_ctx.tpath.push(-1);
  }

  let p = BANNER_INFO.p;
  for (let i=0; i<p.length; i++) {
    let idx = gilbert.xyz2d( p[i][0], p[i][1] ,p[i][2], whd[0], whd[1], whd[2] );
    g_ctx.path[idx] = i;
  }



  let offset = [0,0,0];
  offset = [0,0,50000];

  let _width = window.innerWidth;
  let _height = window.innerHeight;

  g_ctx.scene = new THREE.Scene();
  //g_ctx.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  g_ctx.camera = new THREE.OrthographicCamera( _width/-2, _width/2, _height/-2, _height/2, 1, 1000000);
  g_ctx.camera.position.set( offset[0], offset[1], offset[2] );

  g_ctx.ambient_light = new THREE.AmbientLight( 0xffffff, 0.5 );
  g_ctx.scene.add( g_ctx.ambient_light );

  g_ctx.renderer = new THREE.WebGLRenderer();
  g_ctx.renderer.setSize( window.innerWidth, window.innerHeight );
  g_ctx.renderer.shadowMap.enabled = true;
  document.body.appendChild( g_ctx.renderer.domElement );


  g_ctx.pass_render = new RenderPass( g_ctx.scene, g_ctx.camera );
  g_ctx.pass_bloom = new BloomPass( 1.0, 10, 0.5 );
  g_ctx.pass_output = new OutputPass();

  g_ctx.composer = new EffectComposer(g_ctx.renderer);
  g_ctx.composer.addPass( g_ctx.pass_render );
  g_ctx.composer.addPass( g_ctx.pass_bloom );
  g_ctx.composer.addPass( g_ctx.pass_output );


  g_ctx.controls = new OrbitControls( g_ctx.camera, g_ctx.renderer.domElement );
  g_ctx.controls.update();


  let x_brk = [0,8, 15, 21, 28, 35, 42, 49, 57, 64, 71, 78];

  var colormap_f = mk_colormap_f(x_brk, PAL12);

  for (let i=0; i<BANNER_INFO.p.length; i++) {

    let p = BANNER_INFO.p[i];

    let co = 0xffffff;
    co = colormap_f( p[0] / x_brk[ x_brk.length-1 ] );

    const b_geom = new THREE.BoxGeometry( 1,1,1 );
    const b_matt = new THREE.MeshPhongMaterial( { "color": co, "side":THREE.DoubleSide } );
    //b_geom.computeVertexNormals();

    if (i==1) { g_ctx["matt"] = b_matt; }

    const b_mesh = new THREE.Mesh( b_geom, b_matt );
    b_mesh.position.set(p[0], p[1], p[2]);
    g_ctx.scene.add( b_mesh );

    g_ctx.mesh.push(b_mesh);
  }

  g_ctx.renderer.setAnimationLoop( animate );

}

function update() {
  let whd = BANNER_INFO.size;

  let n = whd[0]*whd[1]*whd[2];

  if (g_ctx.pos_idx == n) {
    console.log("BANG", g_ctx.pos_idx, n);
    return;
  }

  let skip = 240;
  skip = 2;

  let path = g_ctx.path;
  let tpath = g_ctx.tpath;
  let sval = path[0];

  for (let i=0; i<path.length; i++) {
    tpath[ (i+skip) % path.length ] = path[i];
  }
  for (let i=0; i<path.length; i++) {
    path[i] = tpath[i];
  }

  //for (let i=1; i<path.length; i++) { path[i-1] = path[i]; }
  //path[ path.length-1 ] = sval;

  for (let i=0; i<path.length; i++) {
    let mesh_idx = path[i];
    if (mesh_idx < 0) { continue; }

    let xyz = gilbert.d2xyz(i, whd[0], whd[1], whd[2]);

    g_ctx.mesh[mesh_idx].position.set( xyz.x, xyz.y, xyz.z );
  }

  g_ctx.pos_idx+=skip;
}

var time_prv = -1;
function animate( time ) {
  g_ctx.controls.update();
  g_ctx.composer.render();

  if (time_prv < 0) { time_prv = time; }

  if ((time - time_prv) > 150) {
    update();
    time_prv = time;
  }


}

init();

window["foo"] = g_ctx;

