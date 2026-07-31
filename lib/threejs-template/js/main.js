import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

var g_ctx = {
  "scene": null,
  "camera": null,
  "renderer": null,

  "geometry": null,
  "material": null,
  "cube": null

};


function init() {
  g_ctx.scene = new THREE.Scene();
  g_ctx.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  g_ctx.renderer = new THREE.WebGLRenderer();
  g_ctx.renderer.setSize( window.innerWidth, window.innerHeight );
  g_ctx.renderer.setAnimationLoop( animate );
  document.body.appendChild( g_ctx.renderer.domElement );

  g_ctx.geometry = new THREE.BoxGeometry( 1, 1, 1 );
  g_ctx.material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  g_ctx.cube = new THREE.Mesh( g_ctx.geometry, g_ctx.material );
  g_ctx.scene.add( g_ctx.cube );

  g_ctx.camera.position.z = 5;

  console.log("init end");
}

function animate( time ) {
  g_ctx.cube.rotation.x = time / 2000;
  g_ctx.cube.rotation.y = time / 1000;
  g_ctx.renderer.render( g_ctx.scene, g_ctx.camera );
}

init();
