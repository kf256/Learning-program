let cw, ch, cm, cw2, ch2, cm2;
function cnew() {
    cupdate();
    if (canvas.width != cw) canvas.width = cw;
    if (canvas.height != ch) canvas.height = ch;
    cclear();
}
function cupdate() {
    cw = window.innerWidth;
    ch = window.innerHeight;
    cw2 = cw/2;
    ch2 = ch/2;
    cm = Math.min(cw, ch);
    cm2 = cm/2;
}
function cclear() {
    ctx.clearRect(0, 0, cw, ch);
}
function cb() {
    ctx.beginPath();
}
function cc() {
    ctx.closePath();
}
function clinetype(round = true) {
    ctx.lineCap = ctx.lineJoin = round ? "round" : "butt";
}
function cfill(color = "#888") {
    ctx.fillStyle = color;
    ctx.fill();
}
function cstrk(width = 0.01, color = "#888") {
    ctx.strokeStyle = color;
    ctx.lineWidth = cm2*width;
    ctx.stroke();
}
function chsl(h, s = 1, l = 0.5) {
    return "HSL("+h*360+","+s*100+"%,"+l*100+"%)";
}
function crgba(r, g, b, a = 1) {
    return "RGBA("+r*256+","+g*256+","+b*256+","+a+")";
}
function cftext(text, x = 0, y = 0, size = 0.05, color = "#888", font = "sans-serif") {
    ctx.font = String(size*cm2)+"px "+font;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, cw2+cm2*x, ch2+cm2*y);
}
function cstext(text, x = 0, y = 0, size = 0.05, width = 0.01, color = "#888", font = "sans-serif") {
    ctx.font = String(size*cm2)+"px "+font;
    ctx.strokeStyle = color;
    ctx.lineWidth = cm2*width;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(text, cw2+cm2*x, ch2+cm2*y);
}
function crect(x, y, X, Y) {
    ctx.rect(cw2+cm2*x, ch2+cm2*y, cm2*X, cm2*Y);
}
function csquare(s, x = 0, y = 0) {
    crect(x-s, y-s, 2*s, 2*s);
}
function carc(x, y, r, a1 = 0, a2 = Math.PI*2, ccw = false) {
    ctx.arc(cw2+cm2*x, ch2+cm2*y, cm2*r, a1, a2, ccw);
}
function cmove(x, y) {
    ctx.moveTo(cw2+cm2*x, ch2+cm2*y);
}
function cline(x, y) {
    ctx.lineTo(cw2+cm2*x, ch2+cm2*y);
}
function cbezir(x1, y1, x2, y2, x, y) {
    ctx.bezierCurveTo(cw2+cm2*x1, ch2+cm2*y1, cw2+cm2*x2, ch2+cm2*y2, cw2+cm2*x, ch2+cm2*y);
}
function cquadr(x1, y1, x, y) {
    ctx.quadraticCurveTo(cw2+cm2*x1, ch2+cm2*y1, cw2+cm2*x, ch2+cm2*y);
}
function ctext(cmd) {
    let start = {x: 0, y: 0};
    for (let i = 0; i < cmd.length; i++) {
        switch (cmd[i].type) {
            case "M": {
                cmove(cmd[i].x, cmd[i].y);
                start = cmd[i];
                break;
            }
            case "L": {
                cline(cmd[i].x, cmd[i].y);
                break;
            }
            case "C": {
                cbezir(cmd[i].x1, cmd[i].y1, cmd[i].x2, cmd[i].y2, cmd[i].x, cmd[i].y);
                break;
            }
            case "Q": {
                cquadr(cmd[i].x1, cmd[i].y1, cmd[i].x, cmd[i].y);
                break;
            }
            case "Z": {
                cline(start.x, start.y);
                break;
            }
        }
    }
}