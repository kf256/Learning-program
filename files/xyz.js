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
function xyzperspective(point) {
    point.x = Math.atan2(point.x, point.z/perspectiveFactor)*perspectiveFactor;
    point.y = Math.atan2(point.y, point.z/perspectiveFactor)*perspectiveFactor;
}
function xyzrotatex(point, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let yNew = point.y*cos-point.z*sin;
    let zNew = point.y*sin+point.z*cos;
    point.y = yNew;
    point.z = zNew;
}
function xyzrotatey(point, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let zNew = point.z*cos-point.x*sin;
    let xNew = point.z*sin+point.x*cos;
    point.z = zNew;
    point.x = xNew;
}
function xyzrotatez(point, angle) {
    let cos = Math.cos(angle);
    let sin = Math.sin(angle);
    let xNew = point.x*cos-point.y*sin;
    let yNew = point.x*sin+point.y*cos;
    point.x = xNew;
    point.y = yNew;
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
function xyztransform(point) {
    xyzrotatezxy(point);
    xyztranslate(point);
    xyzperspective(point);
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