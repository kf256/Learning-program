let isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
let touches = [];
let touchesLast = [];
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
    for (let i = 0; i < Cursor.instances.length; i++) {
        Cursor.instances[i].update();
    }
}
function touchend(touchpos) {
    touchmove(touchpos);
    for (let i = 0; i < Cursor.instances.length; i++) {
        //Cursor.instances[i].update();
        if (Cursor.instances[i].x == touchpos.x && Cursor.instances[i].y == touchpos.y) {
            
            // call the cursor's remove() function
            Cursor.instances[i].remove();
            
            // remove cursor form instances list
            let instancesBefore = Cursor.instances.slice(0, i);
            let instancesAfter = Cursor.instances.slice(i+1, Cursor.instances.length);
            Cursor.instances = instancesBefore.concat(instancesAfter);
            
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
    updateChangesInTouches();
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
        
        if (index == -1) throw "Cursor does not exist";
        
        this.x = touches[index].x;
        this.y = touches[index].y;
    }
    remove() {
        // code that is executed when the cursor disappears
    }
    
    static instances = [];
}
function updateChangesInTouches() {
    let touchesFinished = new Array(touches.length).fill(false);
    let touchesLastFinished = new Array(touchesLast.length).fill(false);
    let distBetweenCursors = (index1, index2) => {
        let distX = touchesLast[index1].x-touches[index2].x;
        let distY = touchesLast[index1].y-touches[index2].y;
        let dist = Math.hypot(distX, distY);
        return dist;
    };
    let cursorMinDist = (index1, continueIfFinished = true) => {
        let result = Infinity;
        let index = -1;
        for (let index2 = 0; index2 < touches.length; index2++) {
            if (touchesFinished[index2] && continueIfFinished) continue;
            let dist = distBetweenCursors(index1, index2);
            if (dist <= result) {
                result = dist;
                index = index2;
            }
        }
        return {dist: result, index2: index};
    };
    let allCursorsMinDist = () => {
        let result = {dist: Infinity, index1: -1, index2: -1};
        for (let index1 = 0; index1 < touchesLast.length; index1++) {
            if (touchesLastFinished[index1]) continue;
            let data = cursorMinDist(index1);
            if (data.dist <= result.dist) {
                result.dist = data.dist;
                result.index2 = data.index2;
                result.index1 = index1;
            }
        }
        return result;
    };
    while (touchesLastFinished.indexOf(false) != -1) {
        let data = allCursorsMinDist();
        console.log(data);
        if (data.dist == cursorMinDist(data.index1, false).dist) {
            touchesLastFinished[data.index1] = true;
            touchesFinished[data.index2] = true;
            console.log(`Cursor at previous index ${data.index1}, now index ${data.index2}, was moved ${Math.round(data.dist)} Pixels.`);
        } else {
            touchesLastFinished[data.index1] = true;
            console.log(`Cursor at previous index ${data.index1} was removed.`);
        }
        for (let index2 = 0; index2 < touches.length; index2++) {
            if (touchesFinished[index2]) continue;
            console.log(`Cursor at index ${data.index1} was added.`);
        }
    }
    touchesLast = JSON.copy(touches);
};