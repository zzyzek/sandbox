import * as THREE from 'three';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { BloomPass } from 'three/addons/postprocessing/BloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
//import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

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
  "controls": null
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


var colormap_f = mk_colormap_f(COLOR_IDX, PAL12);


function init() {
  let offset = [0,0,0];
  offset = [0,0,-50000];

  let _width = window.innerWidth;
  let _height = window.innerHeight;

  g_ctx.scene = new THREE.Scene();
  //g_ctx.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
  g_ctx.camera = new THREE.OrthographicCamera( _width/-2, _width/2, _height/-2, _height/2, 1, 1000000);
  g_ctx.camera.position.set( offset[0], offset[1], offset[2] );

  g_ctx.ambient_light = new THREE.AmbientLight( 0xffffff, 0.125 );
  g_ctx.scene.add( g_ctx.ambient_light );

  g_ctx.directional_light = new THREE.DirectionalLight( 0xffffff, 2.0 );
  g_ctx.directional_light.position.set(1,1,-10);
  g_ctx.directional_light.target.position.set(0,0,0);
  g_ctx.directional_light.castShadow = true;

  g_ctx.directional_light.shadow.camera.near = -4096;
  g_ctx.directional_light.shadow.camera.far = 4096;
  g_ctx.directional_light.shadow.camera.top =  2048;
  g_ctx.directional_light.shadow.camera.bottom = -2048;
  g_ctx.directional_light.shadow.camera.left = -2048;
  g_ctx.directional_light.shadow.camera.right =  2048;

  g_ctx.directional_light.shadow.mapSize.width = 1024;
  g_ctx.directional_light.shadow.mapSize.height = 1024;
  g_ctx.directional_light.shadow.radius = 4;
  g_ctx.directional_light.shadow.bias = -0.0005;

  g_ctx.scene.add( g_ctx.directional_light );


  g_ctx.directional_light1 = new THREE.DirectionalLight( 0xffffff, 2.0 );
  g_ctx.directional_light1.position.set(0,1,-10);
  g_ctx.directional_light1.target.position.set(0,0,0);
  g_ctx.directional_light1.castShadow = true;

  g_ctx.directional_light1.shadow.camera.near = -4096;
  g_ctx.directional_light1.shadow.camera.far = 4096;
  g_ctx.directional_light1.shadow.camera.top =  2048;
  g_ctx.directional_light1.shadow.camera.bottom = -2048;
  g_ctx.directional_light1.shadow.camera.left = -2048;
  g_ctx.directional_light1.shadow.camera.right =  2048;

  g_ctx.directional_light1.shadow.mapSize.width = 1024;
  g_ctx.directional_light1.shadow.mapSize.height = 1024;
  g_ctx.directional_light1.shadow.radius = 4;
  g_ctx.directional_light1.shadow.bias = -0.0005;

  g_ctx.scene.add( g_ctx.directional_light1 );

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

  let P = bridges2026;


  for (let i=0; i<P.length; i++) {
    P[i][1] *= -1;
    //P[i][0] *= -1;
  }

  let F = 4;
  let cw = F/3;
  cw = F/10;
  cw = F/2;

  for (let i=0; i<P.length; i++) {

    /*
    const geometry = new THREE.BoxGeometry( cw, cw, cw );
    //const geometry = new THREE.BoxGeometry( _x, _y, _z );
    const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
    const cube = new THREE.Mesh( geometry, material );


    cube.position.x = P[i][0]*F;
    cube.position.y = P[i][1]*F;
    cube.position.z = P[i][2]*F;

    g_ctx.scene.add( cube );
    */

    if (i>0) {
      let dx = Math.abs(P[i][0] - P[i-1][0]);
      let dy = Math.abs(P[i][1] - P[i-1][1]);
      let dz = Math.abs(P[i][2] - P[i-1][2]);

      let s = Math.abs(dx+dy+dz);

      let _x = ((dx > 0) ? (F-cw) : cw) ;
      let _y = ((dy > 0) ? (F-cw) : cw) ;
      let _z = ((dz > 0) ? (F-cw) : cw) ;

      let fudge = 1/1024;

      _x = ((dx > 0) ? (F+cw + fudge) : cw) ;
      _y = ((dy > 0) ? (F+cw + fudge) : cw) ;
      _z = ((dz > 0) ? (F+cw + fudge) : cw) ;

      let co = colormap_f( i / P.length );


      const b_geom = new THREE.BoxGeometry( _x, _y, _z );
      //const b_matt = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
      //const b_matt = new THREE.MeshBasicMaterial( { color: co } );
      const b_matt = new THREE.MeshPhongMaterial( { "color": co, "side":THREE.DoubleSide } );
      b_geom.computeVertexNormals();

      if (i==1) { g_ctx["matt"] = b_matt; }

      const b_mesh = new THREE.Mesh( b_geom, b_matt );
      b_mesh.castShadow=true;
      b_mesh.receiveShadow=true;

      //b_mesh.position.x = (F*(P[i][0] + P[i-1][0])/2) + offset[0];
      //b_mesh.position.y = (F*(P[i][1] + P[i-1][1])/2) + offset[1];
      //b_mesh.position.z = (F*(P[i][2] + P[i-1][2])/2) + offset[2];

      b_mesh.position.x = (F*(P[i][0] + P[i-1][0])/2) + 0;
      b_mesh.position.y = (F*(P[i][1] + P[i-1][1])/2) + 0;
      b_mesh.position.z = (F*(P[i][2] + P[i-1][2])/2) - 1000;

      g_ctx.scene.add( b_mesh );


    }

  }

  //g_ctx["geom"] = geometry;
  //g_ctx["cube"] = cube;

  //}

  g_ctx.camera.position.z = 5;

  g_ctx.renderer.setAnimationLoop( animate );
}

//var light_idx = 0;
function animate( time ) {
  //light_idx ++;
  //g_ctx.directional_light.position.set( Math.cos( light_idx ), Math.sin( light_idx ), -1 );

  g_ctx.controls.update();
  //g_ctx.renderer.render( g_ctx.scene, g_ctx.camera );
  g_ctx.composer.render();
}

init();

window["foo"] = g_ctx;

