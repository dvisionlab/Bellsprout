//================================//
//=== CORE FUNCTION ==============//
//================================//

var findIntersection = function(bufferMesh, plane, allDots){

  var verticesArray = bufferMesh.geometry.getAttribute('position').array;

  // get plane normal and constant
  var n = [plane.normal.x, plane.normal.y, plane.normal.z];
  var planeConstantNegated = [plane.normal.clone().multiplyScalar(plane.constant).x, plane.normal.clone().multiplyScalar(plane.constant).y, plane.normal.clone().multiplyScalar(plane.constant).z];
  var d = -plane.constant;

  // initialize variables: vD = difference vector, nP = dot product n*(first point vector), nD = dot product n*vD
  var pA, pB, pC, vectorSubA, vectorSubB, vectorSubC, vD, nP, nD = new Float32Array(3);
  var pointSideA, pointSideB, pointSideC;
  var dot = 0;
  var foundFirst = false;

  for (var cId=0; cId < verticesArray.length; cId +=9 ){

    // flag to manage 1-point case
    foundFirst  = false;

    pA = [verticesArray[cId],  verticesArray[cId+1],verticesArray[cId+2]];
    pB = [verticesArray[cId+3],verticesArray[cId+4],verticesArray[cId+5]];
    pC = [verticesArray[cId+6],verticesArray[cId+7],verticesArray[cId+8]];

    vectorSubA = [pA[0]+planeConstantNegated[0], pA[1]+planeConstantNegated[1], pA[2]+planeConstantNegated[2]];
    vectorSubB = [pB[0]+planeConstantNegated[0], pB[1]+planeConstantNegated[1], pB[2]+planeConstantNegated[2]];
    vectorSubC = [pC[0]+planeConstantNegated[0], pC[1]+planeConstantNegated[1], pC[2]+planeConstantNegated[2]];

    pointSideA = n[0]*vectorSubA[0] + n[1]*vectorSubA[1] + n[2]*vectorSubA[2];
    pointSideB = n[0]*vectorSubB[0] + n[1]*vectorSubB[1] + n[2]*vectorSubB[2];
    pointSideC = n[0]*vectorSubC[0] + n[1]*vectorSubC[1] + n[2]*vectorSubC[2];

    // manage points lying on plane (avoid NaN in computing nD)

    if (pointSideA === 0){
      allDots[dot]   = pA[0];
      allDots[dot+1] = pA[1];
      allDots[dot+2] = pA[2];
      dot+=3;
      foundFirst = true;
    }
    if (pointSideB === 0){
      allDots[dot]   = pB[0];
      allDots[dot+1] = pB[1];
      allDots[dot+2] = pB[2];
      dot+=3;
      if (foundFirst){
        continue;
      }
      else{
        foundFirst = true;
      }
    }
    if (pointSideC === 0){
      allDots[dot]   = pC[0];
      allDots[dot+1] = pC[1];
      allDots[dot+2] = pC[2];
      dot+=3;
      if (foundFirst){
        continue;
      }
      else{
        foundFirst = true;
      }
    }

    // find intersections if points are on opposite sides

    if (pointSideA*pointSideB < 0){
      // B-A, n*A, n*BA
      vD = [pB[0]-pA[0], pB[1]-pA[1], pB[2]-pA[2]];
      nP = n[0]*pA[0] + n[1]*pA[1] + n[2]*pA[2];
      nD = n[0]*vD[0] + n[1]*vD[1] + n[2]*vD[2];
      // store intersection point coordinates
      allDots[dot]   = pA[0] + (((d - nP)/nD) * vD[0]);
      allDots[dot+1] = pA[1] + (((d - nP)/nD) * vD[1]);
      allDots[dot+2] = pA[2] + (((d - nP)/nD) * vD[2]);
      dot+=3;
      if (foundFirst){
        continue;
      }
      else{
        foundFirst = true;
      }
    }
    if (pointSideA*pointSideC < 0){
      // C-A, n*A, n*CA
      vD = [pC[0]-pA[0], pC[1]-pA[1], pC[2]-pA[2]];
      nP = n[0]*pA[0] + n[1]*pA[1] + n[2]*pA[2];
      nD = n[0]*vD[0] + n[1]*vD[1] + n[2]*vD[2];
      // store intersection point coordinates
      allDots[dot]   = pA[0] + (((d - nP)/nD) * vD[0]);
      allDots[dot+1] = pA[1] + (((d - nP)/nD) * vD[1]);
      allDots[dot+2] = pA[2] + (((d - nP)/nD) * vD[2]);
      dot+=3;
      if (foundFirst){
        continue;
      }
      else{
        foundFirst = true;
      }
    }
    if (pointSideB*pointSideC < 0){
      // C-B, n*C, n*CA
      vD = [pC[0]-pB[0], pC[1]-pB[1], pC[2]-pB[2]];
      nP = n[0]*pB[0] + n[1]*pB[1] + n[2]*pB[2];
      nD = n[0]*vD[0] + n[1]*vD[1] + n[2]*vD[2];
      // store intersection point coordinates
      allDots[dot]   = pB[0] + (((d - nP)/nD) * vD[0]);
      allDots[dot+1] = pB[1] + (((d - nP)/nD) * vD[1]);
      allDots[dot+2] = pB[2] + (((d - nP)/nD) * vD[2]);
      dot+=3;
      if (foundFirst){
        continue;
      }
      else{
        foundFirst = true;
      }
    }

    if (foundFirst){
      allDots[dot]   = allDots[dot-3];
      allDots[dot+1] = allDots[dot-2];
      allDots[dot+2] = allDots[dot-1];
      dot+=3;
    }
  }

  allDots = allDots.slice(0,dot); //resize with max index

  return allDots;

};

//=====================================//
//== INTERPOLATE INTERSECTING POINTS ==//
//=====================================//

var drawContour = function(allDots,scene){
  var NoL = 0;

  for (var i=0; i<allDots.length; i+=6){
    if (!isNaN(allDots[i])){
      NoL++;
      var lineGeometry = new THREE.Geometry();
      p1 = new THREE.Vector3(allDots[i],  allDots[i+1],allDots[i+2]);
      p2 = new THREE.Vector3(allDots[i+3],allDots[i+4],allDots[i+5]);
      lineGeometry.vertices.push(p1,p2);
      var lineMaterial = new THREE.LineBasicMaterial( { color : 0x0000ff, linewidth: 2 } );
      var line = new THREE.Line(lineGeometry, lineMaterial);
      line.name = "line_"+i;
      scene.add(line);
    }
    else {
      console.log("Nan at: ",i, allDots);
      break;
    }
  }
    console.log("NoLines: ", NoL, "Array length", allDots.length);
    return;
};

//================================//
//=== CREATE PLANE ===============//
//================================//

var createPlane = function(origin, orientation){
  var u = new THREE.Vector3(orientation[0], orientation[1], orientation[2]);
  var v = new THREE.Vector3(orientation[3], orientation[4], orientation[5]);
  var normalVect = u.cross(v);
  normalVect.normalize();
  var originVect = new THREE.Vector3();
  originVect.fromArray(origin);
  // originVect.projectOnVector(normalVect);
  // console.log(originVect)
  // console.log(normalVect)
  // var distance = -originVect.length();
  // var plane = new THREE.Plane(normalVect,distance);
  var plane = new THREE.Plane();
  plane.setFromNormalAndCoplanarPoint(normalVect, originVect);
  return plane;
};

//================================//
//=== FROM DOTS TO ij ============//
//================================//

var reportToij = function(points, origin, spacing, orientation, thickness){

  var dotsList = [];
  var lines    = [];

  // TODO: remove 3js

  var u = new THREE.Vector3(orientation[0], orientation[1], orientation[2]);
  var v = new THREE.Vector3(orientation[3], orientation[4], orientation[5]);
  var normal = u.clone().cross(v);

  var nX = Math.abs(normal.clone().x);
  var nY = Math.abs(normal.clone().y);
  var nZ = Math.abs(normal.clone().z);

  if (nZ > nX && nZ > nY){
    for (k=0; k<points.length; k+=3){

      var i = Math.round((points[k+1] - origin[1]) / (spacing[0] * orientation[0]));   // pY = points[k+1]
      var j = Math.round((points[k] - origin[0]) / (spacing[1] * orientation[4]));     // pX = points[k]

      // dotsList.push({ "start": i, "end": j });
      dotsList.push(i);
      dotsList.push(j);

    }
  }

  else if (nX > nZ && nX > nY){
    for (k=0; k<points.length; k+=3){

      var i = Math.round((points[k+1] - origin[1]) / (thickness * orientation[2]));    // pY = points[k+1]
      var j = Math.round((points[k+2] - origin[2]) / (spacing[1] * orientation[5]));   // pZ = points[k+2]

      dotsList.push(i);
      dotsList.push(j);

    }
  }

  else if (nY > nZ && nY > nX){
    for (k=0; k<points.length; k+=3){

      var i = Math.round((points[k+2] - origin[2]) / (thickness * orientation[0]));     // pZ = points[k+2]
      var j = Math.round((points[k] - origin[0]) / (spacing[0] * orientation[5]));    // pX = points[k]

      dotsList.push(i);
      dotsList.push(j);

    }
  }

  var i1,i2,j1,j2;
  var start, end = {};

  // TODO: check for speed

  for (d=0; d<dotsList.length; d+=4){
    i1 = dotsList[d];
    j1 = dotsList[d+1];
    i2 = dotsList[d+2];
    j2 = dotsList[d+3];
    if (i1 !== i2 || j1 !== j2){
      start = {"x": i1, "y": j1};
      end   = {"x": i2, "y": j2};
      lines.push({ "start": start, "end": end });
    }
  }

  return lines;

};

//=====================================//
//== GET BIGGEST NORMAL COMPONENT =====//
//=====================================//

var getDir = function(plane){

  var normal = plane.normal;

  if (Math.abs(normal.x) >= Math.abs(normal.y) && Math.abs(normal.x) >= Math.abs(normal.z)){dir = 0;}
  if (Math.abs(normal.y) >= Math.abs(normal.x) && Math.abs(normal.y) >= Math.abs(normal.z)){dir = 1;}
  if (Math.abs(normal.z) >= Math.abs(normal.y) && Math.abs(normal.z) >= Math.abs(normal.x)){dir = 2;}

  return dir;
};

//=====================================//
//== DRAW INTERSECTION PLANE  =========//
//=====================================//

var drawPlane = function (plane,scene,col,size){
  var normal = plane.normal;
  var distance = -plane.constant;
  var translationVector = normal.clone().normalize().multiplyScalar(distance);
  // console.log(translationVector)
  var planeGeometry = new THREE.PlaneGeometry( size, size );
  var planeMaterial = new THREE.MeshPhongMaterial( {color: col, side: THREE.DoubleSide, transparent: true, opacity: 0.4});
  var planeToDraw = new THREE.Mesh( planeGeometry, planeMaterial );
  planeToDraw.name = col;
  planeGeometry.lookAt(normal);
  planeGeometry.translate(translationVector.x,translationVector.y,translationVector.z);
  var axis = new THREE.AxisHelper(10);
  planeToDraw.add(axis);
  scene.add(planeToDraw);
  return (planeToDraw);
};

//================================//
//=== CREATE DATA STRUCTURES =====//
//================================//

var createTree = require('yaot');

var createDataStruct = function(bufferArray){

  // FILTERING BUFFER ARRAY TO AVOID DUPLICATES

  var time1 = Date.now();
  var verticesArray = new Float32Array(bufferArray);

  var coordMap = new Uint32Array(bufferArray.length/3);
  var countArray = new Int32Array(bufferArray.length/3);
  countArray.fill(-1);
  var counter = 0;
  var tree = createTree();
  tree.init(verticesArray);

  for (var i=0; i<verticesArray.length; i+=3){
    var currentVertex = [verticesArray[i], verticesArray[i+1], verticesArray[i+2]];
    var matches = tree.intersectSphere(currentVertex[0], currentVertex[1], currentVertex[2], 1e-20);

    coordMap[i/3] = matches[0]/3;

    if (countArray[coordMap[i/3]] == -1) {
      countArray[i/3] = counter;
      counter += 1;
    }
  }

  //console.log(coordMap)
  //console.log(countArray)

  // CREATING FILTERED VERTICES ARRAY

  var time2 = Date.now();
  var filteredVertices = new Float32Array(3*(counter));

  for (var commonIndex=0; commonIndex < countArray.length; commonIndex++ ){
    if (countArray[commonIndex] != -1){
      var pId = countArray[commonIndex];
      var vertexCoord = [verticesArray[coordMap[commonIndex]*3],verticesArray[coordMap[commonIndex]*3+1],verticesArray[coordMap[commonIndex]*3+2]];
      filteredVertices[pId*3] = vertexCoord[0];
      filteredVertices[pId*3+1] = vertexCoord[1];
      filteredVertices[pId*3+2] = vertexCoord[2];
    }
  }


  // CREATING CELLS ARRAY

  var time3 = Date.now();
  var cellsArray = new Uint32Array(coordMap);

  for (var j=0; j<coordMap.length; j++){

    cellsArray[j] = countArray[coordMap[j]];

  }

  // CREATING LINK ARRAYS

  var time4 = Date.now();
  var recurrenceCounter = new Uint32Array(filteredVertices.length/3);
  recurrenceCounter.fill(1); // init 1 to keep one place free for each link set
  var idPositionArray = new Uint32Array(filteredVertices.length/3);

  for (var p=0; p<cellsArray.length; p++){
    pIdCorrente = cellsArray[p];
    recurrenceCounter[pIdCorrente]++;
  }

  var recurrenceSum = 0;
  for (s=0; s<recurrenceCounter.length; s++){
    idPositionArray[s] = recurrenceSum;
    recurrenceSum = recurrenceSum + recurrenceCounter[s];
  }

  var linksArray = new Int32Array(recurrenceSum);
  linksArray.fill(-1);

  for (u=0; u<idPositionArray.length; u++){
    linksArray[idPositionArray[u]] = recurrenceCounter[u]-1;
  }

  //console.log(linksArray)

  var offsetArray = new Uint32Array(filteredVertices.length/3);
  offsetArray.fill(1);

  for (t=0; t<cellsArray.length; t++){
    var currentPid = cellsArray[t];
    var currentCid = -1;

    switch (t%3){
      case 0: currentCid = t;
              break;
      case 1: currentCid = t-1;
              break;
      case 2: currentCid = t-2;
              break;
    }

    var position = idPositionArray[currentPid];
    var offset = offsetArray[currentPid];
    linksArray[ position + offset ] = currentCid;
    offsetArray[currentPid]++;
  }

  // console.log("time1: " + (time2-time1));
  // console.log("time2: " + (time3-time2));
  // console.log("time3: " + (time4-time3));
  // console.log("time4: " + (Date.now()-time4));
  //
  // console.log(verticesArray);       // INPUT BUFFER ARRAY
  // console.log(filteredVertices);    // VERTICES ARRAY
  // console.log(cellsArray);          // CELLS ARRAY
  // console.log(linksArray);          // LINKS ARRAY
  // console.log(idPositionArray);     // ID POSITIONS INSIDE LINKS ARRAY

  return [filteredVertices, cellsArray, linksArray, idPositionArray];
};

//================================//
//=== EXPORT FUNCTIONS ===========//
//================================//

exports.find         = findIntersection;
exports.drawContour  = drawContour;
exports.plane        = createPlane;
exports.drawPlane    = drawPlane;
exports.toij         = reportToij;
exports.createStruct = createDataStruct;
