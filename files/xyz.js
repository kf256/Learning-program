let xyzrot = {x: 0, y: 0, z: 0};
let xyzloc = {x: 0, y: 0, z: 0};
function xyzreset() {
    xyzrot = {x: 0, y: 0, z: 0};
    xyzloc = {x: 0, y: 0, z: 0};
}
function xyzpolygon(points) {
    for (let i = 0; i < points.length; i++) {
        xyzrtt(points[i]);
        if (i == 0) cmove(points[i].x, points[i].y);
        else cline(points[i].x, points[i].y);
    }
    cline(points[0].x, points[0].y);
}
function xyztransform(point) {
    point.x-= pos.x;
    point.y-= pos.y;
    point.z-= pos.z;
    xyzrotatex(point, rot.x);
    xyzrotatey(point, rot.y);
    xyzrotatez(point, rot.z);
    point.x = Math.atan2(point.x, point.z/perspectiveFactor)*perspectiveFactor;
    point.y = Math.atan2(point.y, point.z/perspectiveFactor)*perspectiveFactor;
}
function xyzrotatex(point, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let pointOld = point;
    point.x = pointOld.x;
    point.y = pointOld.y*cos-pointOld.z*sin;
    point.z = pointOld.y*sin+pointOld.z*cos;
}
function xyzrotatey(point, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let pointOld = point;
    point.y = pointOld.y;
    point.x = pointOld.x*cos-pointOld.z*sin;
    point.z = pointOld.x*sin+pointOld.z*cos;
}
function xyzrotatez(point, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let pointOld = point;
    point.z = pointOld.z;
    point.y = pointOld.y*cos-pointOld.x*sin;
    point.x = pointOld.y*sin+pointOld.x*cos;
}
function xyzrotatezxy(point) {
    xyzrotatez(point, xyzrot.z);
    xyzrotatex(point, xyzrot.x);
    xyzrotatey(point, xyzrot.y);
}
function xyztranslate(point) {
    point.x += xyzloc.x;
    point.y += xyzloc.y;
    point.z += xyzloc.z;
}
function xyzrtt(point) {
    xyzrotatezxy(point);
    xyztranslate(point);
    xyztransform(point);
    return point;
}
function xyzsquare(size, x, y) {
    let data = [
        {x: x-size/2, y: y-size/2, z: 0},
        {x: x-size/2, y: y+size/2, z: 0},
        {x: x+size/2, y: y+size/2, z: 0},
        {x: x+size/2, y: y-size/2, z: 0}
    ];
    return data;
}
function xyzmove(point) {
    xyzrtt(point);
    cmove(point.x, point.y);
}
function xyzline(point) {
    xyzrtt(point);
    cline(point.x, point.y);
}
function xyzbezir(point1, point2, point) {
    xyzrtt(point1);
    xyzrtt(point2);
    xyzrtt(point);
    cbezir(point1.x, point1.y, point2.x, point2.y, point.x, point.y);
}
function xyzquadr(point1, point) {
    xyzrtt(point1);
    xyzrtt(point);
    cbezir(point1.x, point1.y, point.x, point.y);
}
function xyztext(cmd, z = 0) {
    let start = {x: 0, y: 0, z: z};
    for (let i = 0; i < cmd.length; i++) {
        switch (cmd[i].type) {
            case "M": {
                xyzmove({x: cmd[i].x, y: cmd[i].y, z: z});
                start = cmd[i];
                break;
            }
            case "L": {
                xyzline({x: cmd[i].x, y: cmd[i].y, z: z});
                break;
            }
            case "C": {
                xyzbezir({x: cmd[i].x1, y: cmd[i].y1, z: z}, {x: cmd[i].x2, y: cmd[i].y2, z: z}, {x: cmd[i].x, y: cmd[i].y, z: z});
                break;
            }
            case "Q": {
                xyzquadr({x: cmd[i].x1, y: cmd[i].y1, z: z}, {x: cmd[i].x, y: cmd[i].y, z: z});
                break;
            }
            case "Z": {
                xyzline({x: start.x, y: start.y, z: z});
                break;
            }
        }
    }
}