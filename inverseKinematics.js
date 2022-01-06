/*******************************************************************************
By Noah Trueblood on 19 February 2019

An implementation of FABRIK aside a little library intended to ease IK chain
manipulation making projects with threejs and beyond.

This file contains the implementation of FABRIK as well as a function for
interpolating between goal/target points. The function is called moveTowards.
*******************************************************************************/
function distance(firstPoint, secondPoint) {
    return findMagnitude(minus(firstPoint, secondPoint));
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

    return scaleBy(vector, 1./mag);
}

function plus(point0, point1)
{
    return {
x:
        point0.x+point1.x,
y:
        point0.y+point1.y,
z:
        point0.z+point1.z
    };
}

function minus(pointEnd, pointStart)
{
    return plus(pointEnd, scaleBy(pointStart, -1.));
}

function scaleBy(vector, scale)
{
    return {
x:
        vector.x * scale,
y:
        vector.y * scale,
z:
        vector.z * scale
    };
}

function fabrik_single(points, goalPos, step)
{
    let currentGoal=goalPos;
    let first=0;
    let last = points.length - 1;
    if (step == -1)
    {
        first = last;
        last = 0;
    }
    const passLast = last + step;

    for (let i = first; i != passLast; i += step)
    {
        if (i!=last)
            length = distance(points[i + step], points[i]);

        points[i] = currentGoal;

        if (i==last)
            break;

        const lineDirection = normalize(minus(points[i+step], currentGoal));

        const updatedLength = scaleBy(lineDirection, length);

        currentGoal = plus(points[i], updatedLength);
    }

    return points;
}

// Part one
function fabrik_finalToRoot(points, goalPos) {
    return fabrik_single(points, goalPos, -1);
}

// Part two
function fabrik_rootToFinal(points, goalPos) {
    return fabrik_single(points, goalPos, 1);
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
        const direction = normalize(minus(goalPos, points[0]));
        // reach until max in direction of goal

        let lastPoint = points[0];
        let savedPoint = lastPoint;
        for(let i=0; i<points.length; i++)
        {
            const segment = distance(points[i], savedPoint);
            savedPoint=points[i];
            lastPoint = plus(lastPoint, scaleBy(direction, segment));
            points[i] = lastPoint
        }
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
