/*******************************************************************************
By Noah Trueblood on 19 February 2019

An implementation of FABRIK aside a little library intended to ease IK chain
manipulation making projects with threejs and beyond.

This file is a little test that depicts a simple two segment arm moving between
two goal points.
*******************************************************************************/
function disableFrustCull(child)
{
  child.traverse((childObj) => {
    childObj.frustumCulled = false;
  });
}

function mapPoints(segments)
{
  let point0={x:0, y:0, z:0};
  let points=[point0];
  for(let i=0; i<segments.length; i++)
  {
    let prev = points[points.length - 1];
    let point1 = {x:prev.x, y:prev.y+segments[i], z:prev.z};
    points.splice(points.length, 0, point1);
  }
  return points;
}

function createScenePoints(points)
{
  let scenePoints=[];
  for(let i=0; i<points.length; i++)
  {
    let p=points[i];
    let scenePoint=createPoint({x:p.x, y:p.y, z:p.z, size:3});
    disableFrustCull(scenePoint);
    scenePoints.splice(scenePoints.length, 0, scenePoint);
  }
  return scenePoints;
}

function createLines(points)
{
  let lines=[];
  for (let i=1; i<points.length; i++)
  {
    let line = createLine({
      x0: points[i-1].x,
      y0: points[i-1].y,
      z0: points[i-1].z,
      x1: points[i].x,
      y1: points[i].y,
      z1: points[i].z,
    });
    disableFrustCull(line);
    lines.splice(lines.length, 0, line);
  }
  return lines;
}

function displayPoints(scenePoints, lines, points)
{
      for (let i=0; i<scenePoints.length; i++)
      {
        scenePoints[i].geometry.vertices[0].x = points[i].x;
        scenePoints[i].geometry.vertices[0].y = points[i].y;
        scenePoints[i].geometry.vertices[0].z = points[i].z;
        scenePoints[i].geometry.verticesNeedUpdate = true;

        if (i>0)
        {
            lines[i-1].geometry.vertices[0].x = points[i-1].x;
            lines[i-1].geometry.vertices[0].y = points[i-1].y;
            lines[i-1].geometry.vertices[0].z = points[i-1].z;
            lines[i-1].geometry.vertices[1].x = points[i].x;
            lines[i-1].geometry.vertices[1].y = points[i].y;
            lines[i-1].geometry.vertices[1].z = points[i].z;
            lines[i-1].geometry.verticesNeedUpdate = true;
        }
      }
}

function testFabrik() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 10;
  renderer = new THREE.WebGLRenderer(antialias = true);
  renderer.setSize(window.innerWidth, window.innerHeight);

  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
  }

  const segments =[1, 1];
  let points=mapPoints(segments);
  let scenePoints=createScenePoints(points);
  for (let i=0; i<scenePoints.length; i++)
  {
    scene.add(scenePoints[i]);
  }

  console.log(points[0].x, points[0].y, points[0].z, points[1].x, points[1].y, points[1].z);

  const lines = createLines(points);
  for (let i=0; i<lines.length; i++)
  {
    scene.add(lines[i]);
  }

  document.body.appendChild(renderer.domElement);

  animate();

  let xVal = 0;
  let yVal = 2;
  let zVal = 0;

  const moveSpeed = 0.01;


  const positionUp = { x: 0, y: 2, z: 0 };
  const positionDown = { x: 0.2, y: 0.75, z: 0 };

  const goalPositions = [
    positionUp,
    positionDown
  ];

  let currentPosition = 0;

  window.setInterval(function() {
    const goalPos = goalPositions[currentPosition];

    const xMove = moveTowards(xVal, goalPos.x, moveSpeed);
    xVal = xMove.newVal;
    const yMove = moveTowards(yVal, goalPos.y, moveSpeed);
    yVal = yMove.newVal;
    const zMove = moveTowards(zVal, goalPos.z, moveSpeed);
    zVal = zMove.newVal;

    const intermediateGoalPos = { x: xVal, y: yVal, z: zVal };

    points = fabrik(points, intermediateGoalPos, points.length);

    displayPoints(scenePoints, lines, points);

    if (xMove.reached && yMove.reached && zMove.reached) {
      currentPosition = (currentPosition + 1) % 2;
    }

  }, 10);
}

testFabrik();
