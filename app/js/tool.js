
var path              = require('path');
var TrackballControls = require( path.join( rootPath, 'lib', 'TrackballControls.js'));
var sliderTool        = require( path.join( rootPath, 'lib', 'dat.gui.min.js'));
var STLLoader         = require( path.join( rootPath, 'lib', 'stl-loader.js'))(THREE);
var move              = require( path.join( rootPath, 'js', 'moveFunction.js')); // change geometry on keypress
var intersect         = require( path.join( rootPath, 'js', 'intersect.js')); // core function

var bufferGeom = new THREE.BufferGeometry();
var bufferMesh = new THREE.Mesh();
var bufferMat  = new THREE.MeshBasicMaterial( { color: 0x441123, wireframe: true} );
var lineSpline;
var bb;

// setup
var object    = "cube";        // "cube", "sphere", "STL"
var edgeNodes = 50;           // to scale the problem
var filePath  = "./resources/dima_dec75.stl";

// var initScene = function( canvasId ) {
var initScene = function() {

//================================//
//====== SCENE ===================//
//================================//

var scene = new THREE.Scene();
scene.name = "scene";
var camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 10000 );

var renderer = new THREE.WebGLRenderer( { antialias: true } );
document.getElementById("canvas-container").appendChild(renderer.domElement);
renderer.setClearColor( 0xAAAAAA, 1 );
renderer.setSize(512,512);

var control = new THREE.TrackballControls( camera, renderer.domElement );

var light = new THREE.AmbientLight( 0xffffff, 1 ); // soft white light
var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
directionalLight.position.set (0,1,1);
scene.add( light );
scene.add( directionalLight );

camera.position.z = edgeNodes * 10;
camera.position.y = edgeNodes * 10;
camera.position.x = edgeNodes * 10;

camera.lookAt(0,3,0);

var gridPlane = new THREE.GridHelper(300,50);
var gridPlaneAxis = new THREE.AxisHelper(20);
scene.add (gridPlane);
scene.add (gridPlaneAxis);


//================================//
//====== SCENE CONTENT ===========//
//================================//

if (object == "STL"){
  //ADD MESH FROM STL
  var loader = new STLLoader();
  var geometryFunction = function(_geometry){
    //_geometry.rotateY(Math.PI/2);
    _geometry.computeBoundingBox();
    var bb= _geometry.boundingBox;
    _geometry.translate(-bb.min.x, -bb.min.y, -bb.min.z);
    bufferGeom = _geometry;
    bufferMesh = new THREE.Mesh( bufferGeom, bufferMat );
    bufferMesh.geometry.verticesNeedsUpdate = true;
    scene.add(bufferMesh);
    var verticesArray = bufferMesh.geometry.getAttribute('position').array;
    dataStruct = intersect.createStruct(verticesArray);
  };

  loader.load(filePath, geometryFunction);
  setTimeout(1000);
}

if (object == "cube"){
  //ADD CUBE
  var cubeGeometry = new THREE.BoxGeometry( 10*edgeNodes, 10*edgeNodes, 10*edgeNodes, edgeNodes, edgeNodes, edgeNodes);
  bufferGeom.fromGeometry(cubeGeometry);
  bufferMesh = new THREE.Mesh( bufferGeom, bufferMat );
  bufferMesh.geometry.verticesNeedsUpdate = true;
  scene.add(bufferMesh);
  console.log(bufferMesh);
  // var verticesArray = bufferMesh.geometry.getAttribute('position').array;
  // dataStruct = intersect.createStruct(verticesArray);
}

if (object == "sphere"){
  //ADD CUBE
  var sphereGeometry = new THREE.SphereGeometry( edgeNodes, 5*edgeNodes, 5*edgeNodes);
  bufferGeom.fromGeometry(sphereGeometry);
  bufferMesh = new THREE.Mesh( bufferGeom, bufferMat );
  bufferMesh.geometry.verticesNeedsUpdate = true;
  scene.add(bufferMesh);
  // var verticesArray = bufferMesh.geometry.getAttribute('position').array;
  // dataStruct = intersect.createStruct(verticesArray);
}

  //ADD PLANE
  orientation = [[0,0,1],[1,0,0]];
  origin = [0,3,0];
  spacing = [2,2];
  thickness = 2;

  // var plane = intersect.plane(origin,orientation);
  var plane = new THREE.Plane(new THREE.Vector3(0,1,0),0);
  // console.log(plane);
  // console.log(plane.coplanarPoint());
  var size = edgeNodes*20;
  intersect.drawPlane(plane,scene,"green",size);

  // ADD GOOD POINTS

  var dotsGeometry = new THREE.Geometry();
  var dotsMaterial = new THREE.PointsMaterial( { size: 10, sizeAttenuation: false } );
  var dots = new THREE.Points( dotsGeometry, dotsMaterial );
  dots.geometry.verticesNeedsUpdate = true;

  //================================//
  //======= USER INTERACTION =======//
  //================================//

  // SLIDERS: move the plane

  var gui = new dat.GUI({
      height : 4 * 32 - 1
  });

  var params = {
      normal_X: 0,
      normal_Y: 1,
      normal_Z: 0,
      translation: 0
  };

  gui.add(params, "normal_X").min(-1).max(1).step(0.1).onChange(function() {
    updateScene(plane, params, scene, edgeNodes);
    drawIntersection(bufferMesh, plane, scene);
  });

  gui.add(params, "normal_Y").min(-1).max(1).step(0.1).onChange(function() {
    updateScene(plane, params, scene, edgeNodes);
    drawIntersection(bufferMesh, plane, scene);
  });

  gui.add(params, "normal_Z").min(-1).max(1).step(0.1).onChange(function() {
    updateScene(plane, params, scene, edgeNodes);
    drawIntersection(bufferMesh, plane, scene);
  });

  gui.add(params, "translation").min(-edgeNodes*10).max(edgeNodes*10).step(0.1).onChange(function() {
    updateScene(plane, params, scene, edgeNodes);
    drawIntersection(bufferMesh, plane, scene);
  });

// KEY PRESS: move the mesh

/*
window.addEventListener('keydown', function(event) {

    scene.remove(dots);
    scene.remove(lineSpline);

    bufferMesh = move.moveFunction(bufferMesh,event.keyCode);

    // create new geometry dataStruct after moving object
    var verticesArray = bufferGeom.getAttribute('position').array;

    var dataStruct = intersect.createStruct(verticesArray);

    // look for new intersecting points
    drawIntersection(dataStruct, plane, scene);

    // TO ij
    // intersect.toij(dots, origin, spacing, orientation, thickness);
});
*/

//================================//
//====== RENDER FUNCTION =========//
//================================//

  function render() {
  	requestAnimationFrame( render );
    control.update(0.5);
  	renderer.render( scene, camera );
  }

  render();
};



//===========================================//
//== MOVE PLANE ACCORDING TO SLIDER VALUES ==//
//===========================================//

var updateScene = function(plane, values, scene, edgeNodes){

  var scenePlane = scene.getObjectByName( "green" );
  if (scenePlane){
    norm = new THREE.Vector3(values.normal_X,values.normal_Y,values.normal_Z).normalize();
    plane.setComponents(norm.x,norm.y,norm.z,-values.translation);
    scene.remove(scenePlane);
  }
  else {
    var plane = new THREE.Plane(new THREE.Vector3(values.normal_X,values.normal_Y,values.normal_Z).normalize(),-values.translation);
  }
  var size = edgeNodes*20;
  intersect.drawPlane(plane, scene, "green", size);
};

//======================================//
//=== REMOVE INTERSECTION ==============//
//======================================//

var removeIntersection = function(scene){
  var children = scene.children.length;
  for (var k=0; k<children; k++){
    currElem = scene.children[k];
    if (currElem.type == "Points" || currElem.type == "Line"){
      scene.remove(currElem);
      k--;
      children = scene.children.length;
    }
  }
};

//======================================//
//=== DRAW INTERSECTION ================//
//======================================//

var drawIntersection = function(mesh, plane, scene){

  var allDots = new Float32Array(mesh.geometry.attributes.position.array.length/12);  // TODO move this to the best point

  var timeStart = Date.now();
  allDots = intersect.find(mesh,plane,allDots);  // seems to be better than:
  // intersect.find(mesh,plane,allDots);
  var timeEnd = Date.now();
  console.log("drawIntersection tot.", timeEnd - timeStart);

  if (allDots){
    removeIntersection(scene);
    intersect.drawContour(allDots,scene);
  }
  else {
    removeIntersection(scene);
    console.log("nothing to draw");
  }

  intersect.toij(allDots, origin, spacing, orientation, thickness);

  return;
};


exports.render = initScene;
