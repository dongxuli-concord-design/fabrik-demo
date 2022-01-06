/*******************************************************************************
By Noah Trueblood on 19 February 2019

An implementation of FABRIK aside a little library intended to ease IK chain
manipulation making projects with threejs and beyond.

This file is a little test that depicts a simple two segment arm moving between
two goal points.
*******************************************************************************/

// segment lengths defined here
const segments =[1, 0.75, 0.5, 0.3,0.2, 0.1];
//const segments =[1, 0.5, 0.2, 0.1];

function disableFrustCull(child)
{
    child.traverse((childObj) => {
        childObj.frustumCulled = false;
    });
}

function mapPoints(segments)
{
    let point0= {x:0, y:0, z:0};
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
    camera.position.z = 15;
    renderer = new THREE.WebGLRenderer(antialias = true);
    renderer.setSize(window.innerWidth, window.innerHeight);

    function animate() {
        requestAnimationFrame(animate);

        renderer.render(scene, camera);
    }

    let points=mapPoints(segments);
    let scenePoints=createScenePoints(points);
    for (let i=0; i<scenePoints.length; i++)
    {
        scene.add(scenePoints[i]);
    }

    const lines = createLines(points);
    for (let i=0; i<lines.length; i++)
    {
        scene.add(lines[i]);
    }

    document.body.appendChild(renderer.domElement);

    animate();

    let iAngle=0;
    let aSteps=100;

    // points = fabrik(points, positionDown);
    // throw new Error("Here we stop");

    window.setInterval(function() {

        // Goal position animation defined here
        a = (2.*Math.PI*iAngle)/aSteps;
        const intermediateGoalPos = { x: 2+ 2.*Math.cos(a), y: 2 + 1.2*Math.sin(a), z: 1.};

        points = fabrik(points, intermediateGoalPos);

        displayPoints(scenePoints, lines, points);

        iAngle=(iAngle+1)%aSteps;

    }, 10);
}

testFabrik();
