function drawStarCursor(cursor) {
    cb();
    for (let j = 0; j <= 10; j++) {
        let a = j/10*Math.PI*2+Date.now()*cursorSpeed;
        let r = (j%2+0.8)*cm*cursorSize*2;
        let x = Math.cos(a)*r+cursor.x;
        let y = Math.sin(a)*r+cursor.y;
        if (j == 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    cfill("#ff0");
    cstrk(cursorSize, "#000");
    cc();
}
function drawEarthCursor(cursor) {
    let s = Math.round(cm*cursorSize*3);
    let imageData = ctx.getImageData(cursor.x-s, cursor.y-s, 2*s, 2*s);
    for (let y = -s; y < s; y++) {
        let width = Math.sqrt(s**2-y**2);
        for (let x = -s; x < s; x++) {
            let index = (x+s+(y+s)*s*2)*4;
            let f = 1-Math.asin(Math.hypot(x, y)/s)/Math.PI*1;
            if (Math.abs(x) > width) continue;
            let X = Math.asin(x/width)/Math.PI/2+new Date().getTime()/10*cursorSpeed;
            let Y = y/s/2+0.5;
            if (getImagePixel("earth", X, Y)) {
                // blue
                imageData.data[index+0] = 0*f;
                imageData.data[index+1] = 0*f;
                imageData.data[index+2] = 255*f;
                imageData.data[index+3] = 255;
            } else {
                // green
                imageData.data[index+0] = 0*f;
                imageData.data[index+1] = 255*f;
                imageData.data[index+2] = 0*f;
                imageData.data[index+3] = 255;
            }
        }
    }
    ctx.putImageData(imageData, cursor.x-s, cursor.y-s);
}
class PaintedCursor extends Cursor {
    constructor(index) {
        super(index);
        PaintedCursor.instances.push(this);
        this.status = "appearing";
        this.size = 0;
        this.lastUpdate = Date.now();
    }
    remove() {
        this.status = "disappearing";
    }
    draw() {
        if (this.status == "appearing") {
            this.size += (Date.now()-this.lastUpdate)/1000;
            if (this.size > 1) {
                this.size = 1;
                this.status = "visible";
            }
        } else if (this.status == "disappearing") {
            this.size -= (Date.now()-this.lastUpdate)/1000;
            if (this.size < 0) {
                // remove cursor from instances list
                let instancesBefore = PaintedCursor.instances.slice(0, this.index);
                let instancesAfter = PaintedCursor.instances.slice(this.index+1, PaintedCursor.instances.length);
                PaintedCursor.instances = instancesBefore.concat(instancesAfter);
                return;
            }
        }
        this.lastUpdate = Date.now();
        switch (cursorType) {
            case 0: drawStarCursor(this);  break;
            case 1: drawEarthCursor(this); break;
        }
    }
    
    static instances = [];
    static draw() {
        for (let i = 0; i < PaintedCursor.instances.length; i++) PaintedCursor.instances[i].draw();
    }
}