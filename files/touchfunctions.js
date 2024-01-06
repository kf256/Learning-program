let isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
let touches = [];
if (!isTouchDevice) {
    canvas.addEventListener("mousedown",   (evt) => {touchupdate(evt,0);});
    canvas.addEventListener("mousemove",   (evt) => {touchupdate(evt,1);});
    canvas.addEventListener("mouseup",     (evt) => {touchupdate(evt,2);});
} else {
    canvas.addEventListener("touchstart",  (evt) => {touchupdate(evt,0);});
    canvas.addEventListener("touchmove",   (evt) => {touchupdate(evt,1);});
    canvas.addEventListener("touchend",    (evt) => {touchupdate(evt,2);});
    canvas.addEventListener("touchcancel", (evt) => {touchupdate(evt,2);});
}
function touchstart(touchpos) {
    console.log("touchstart", Date.now()%1000);
    if (state == "not started") {
        enterFullscreen();
        state = "start";
    } else if (state == "start") {
        newTasks();
        state = "learning";
    }
    if (state == "learning") {
        let x = 0.3-cw/cm;
        let y = ch/cm-0.3;
        let r = 0.2;
        let dx = (touchpos.x-cw2-cm2*x)/cm2;
        let dy = (touchpos.y-ch2-cm2*y)/cm2;
        let d = Math.sqrt(dx**2+dy**2);
        if (d < r) {
            controlCursor = new Cursor(touchpos.x, touchpos.y);
            controlCursor.remove = function() {
                controlCursor = null;
            };
        }
    }
}
function touchmove(touchpos) {
    console.log("touchmove", Date.now()%1000);
    for (let i = 0; i < Cursor.instances.length; i++) {
        Cursor.instances[i].update();
    }
}
function touchend(touchpos) {
    console.log("touchend", Date.now()%1000);
    for (let i = 0; i < Cursor.instances.length; i++) {
        //Cursor.instances[i].update();
        if (Cursor.instances[i].x == touchpos.x && Cursor.instances[i].y == touchpos.y) {
            
            // call the cursor's remove() function
            Cursor.instances[i].remove();
            
            // remove cursor form instances list
            let instancesBefore = Cursor.instances.slice(0, i);
            let instancesAfter = Cursor.instances.slice(i+1, Cursor.instances.length);
            Cursor.instances = instancesBefore.concat(instancesAfter);
            
            console.log("Removed", Cursor.instances, controlCursor);
            
            // as the cursor, which was previously at index i+1, is now at index i, index i must be checked again
            i--;
        }
    }
}
function touchupdate(evt, type) {
    if (isTouchDevice) {
        touches = [];
        for (let i = 0; i < evt.touches.length; i++) touches[i] = {x: evt.touches[i].clientX, y: evt.touches[i].clientY};
    } else {
        if (type == 0 || (type == 1 && touches[0])) {
            touches[0] = {x: evt.clientX, y: evt.clientY};
            canvas.style.cursor = "none";
        } else {
            touches = [];
            canvas.style.cursor = "";
        }
    }
    let touchpos = isTouchDevice ? {x: evt.pageX, y: evt.pageY} : {x: evt.clientX, y: evt.clientY};
    switch (type) {
        case 0: touchstart(touchpos); break;
        case 1: touchmove(touchpos);  break;
        case 2: touchend(touchpos);   break;
    }
}
class Cursor {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        Cursor.instances.push(this);
    }
    update() {
        let index = -1;
        let indexDist = Infinity;
        for (let i = 0; i < touches.length; i++) {
            let distX = this.x-touches[i].x;
            let distY = this.y-touches[i].y;
            let dist = Math.hypot(distX, distY);
            if (dist < indexDist) {
                indexDist = dist;
                index = i;
            }
        }
        if (index == -1) {
            throw "Cursor does not exist";
        } else {
            this.x = touches[index].x;
            this.y = touches[index].y;
        }
    }
    remove() {
        // code that is executed when the cursor disappears
    }
    
    static instances = [];
}