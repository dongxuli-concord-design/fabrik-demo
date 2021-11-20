/*******************************************************************************
By Noah Trueblood on 19 February 2019

An implementation of FABRIK aside a little library intended to ease IK chain
manipulation making projects with threejs and beyond.

This file contains the implementation of FABRIK as well as a function for
interpolating between goal/target points. The function is called moveTowards.
*******************************************************************************/
function distance(firstPoint, secondPoint) {
  const xDif = secondPoint.x - firstPoint.x;
  const yDif = secondPoint.y - firstPoint.y;
  const zDif = secondPoint.z - firstPoint.z;

  const dist = Math.hypot(xDif, yDif, zDif);

  return dist;
}

function needToMove(endEffectorPos, goalPos, epsilon) {
  const distFromGoal = distance(endEffectorPos, goalPos);

  return (distFromGoal > epsilon);
}

function targetReachable(points, goalPos) {
  const basePoint = points[0];
  let maxReach = 0;

  let lastPoint = basePoint;
  points.forEach((point) => {
    maxReach += distance(lastPoint, point);
    lastPoint = point;
  });

  const distFromGoal = distance(basePoint, goalPos);

  const isReachable = distFromGoal <= maxReach;

  return { isReachable, maxReach };
}

function findMagnitude(vector) {

  const mag = Math.hypot(vector.x, vector.y, vector.z);

  return mag;
}

function normalize(vector) {
  const mag = findMagnitude(vector);
  if (mag == 0)
  	return {x:0, y:0, z:0};

  const normX = vector.x / mag;
  const normY = vector.y / mag;
  const normZ = vector.z / mag;

  const normVec = { x: normX, y: normY, z: normZ };

  return normVec;
}

function plus(point0, point1)
{
  return {
    x:point0.x+point1.x,
    y:point0.y+point1.y,
    z:point0.z+point1.z
  };
}

// Part one
function fabrik_finalToRoot(points, goalPos) {
  let currentGoal = goalPos;
  let length=1;

  for (let i = points.length - 1; i >= 0; i -= 1) {
    if (i>0)
      length = distance(points[i - 1], points[i]);

    points[i] = currentGoal;
    if (i>0)
    {

    const lineDirection = normalize(minus(points[i-1], currentGoal));

    const updatedLength = scaleBy(lineDirection, length);

    currentGoal = plus(points[i], updatedLength);

    console.log("ToRoot: " + i);
    console.log(distance(points[i], currentGoal));
  }
  }

  return points;
}

function minus(pointEnd, pointStart)
{
  return {
    x:pointEnd.x - pointStart.x,
    y:pointEnd.y - pointStart.y,
    z:pointEnd.z - pointStart.z
  };
}

function scaleBy(vector, scale)
{
    return {
      x:vector.x * scale,
      y:vector.y * scale,
      z:vector.z * scale
    };
}

// Part two
function fabrik_rootToFinal(points, goalPos) {
  let currentGoal = goalPos;
  let length=1;

  for(let i = 0; i < points.length; i += 1) {
    if (i < points.length - 1)
      length = distance(points[i], points[i+1]);

    points[i] = currentGoal;
    if (i<points.length)
    {

    console.log(i, points.length);
    const lineDirection = normalize(minus(points[i+1], points[i]));

    const updatedLength = scaleBy(lineDirection, length);

    // This is where constraint adjustment would happen.
    // Adjust the point before assigning it
    currentGoal = plus(points[i], updatedLength);
    console.log("ToFinal: " + i);
    console.log(distance(points[i], currentGoal));
  }
  }

  return points;
}

function fabrik(points, goalPos, epsilon = 2e-3) {
  const { isReachable, maxReach } = targetReachable(points, goalPos)
  if (isReachable) {
    let endEffectorPos = points[points.length - 1];
    let basePos=points[0];
    while(needToMove(endEffectorPos, goalPos, epsilon)) {
      points = fabrik_finalToRoot(points, goalPos); // Part one
      points = fabrik_rootToFinal(points, basePos); // Part two

      endEffectorPos = points[points.length - 1];
    }
  } else {
    const direction = normalize(goalPos);
    // reach until max in direction of goal
    const reachGoalX = direction.x * (maxReach * 0.99);
    const reachGoalY = direction.y * (maxReach * 0.99);
    const reachGoalZ = direction.z * (maxReach * 0.99);

    reachGoalPos = { x: reachGoalX, y: reachGoalY, z: reachGoalZ };

    return fabrik(points, reachGoalPos);
  }

  return points;
}

// For interpolating between two points.
function moveTowards(currentVal, goalVal, moveSpeed) {
  let newVal = currentVal;
  if (currentVal < goalVal) {
    const distLeft = goalVal - currentVal
    if (distLeft < moveSpeed) {
      newVal = currentVal + distLeft;
    } else {
      newVal = currentVal + moveSpeed;
    }
  }
  if (currentVal > goalVal) {
    const distLeft = currentVal - goalVal
    if (distLeft < moveSpeed) {
      newVal = currentVal - distLeft;
    } else {
      newVal = currentVal - moveSpeed;
    }
  }
  if (currentVal == goalVal) {
    return { reached: true, newVal };
  }
  return { reached: false, newVal };
}
