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
function touchstart(index) {
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
        let dx = (touches[index].x-cw2-cm2*x)/cm2;
        let dy = (touches[index].y-ch2-cm2*y)/cm2;
        let d = Math.sqrt(dx**2+dy**2);
        if (d < r) {
            controlCursor = new Cursor(index);
            controlCursor.remove = function() {
                controlCursor = null;
                console.log("removed");
            };
        }
    }
}
function touchmove(indexOld, indexNew) {
    console.log(indexOld, indexNew);
    // ...
}
function touchend(index) {
    console.log(index);
    // ...
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
}
class Cursor {
    constructor(index) {
        this.index = index;
        Cursor.instances.push(this);
    }
    get x() {
        return touches[this.index].x;
    }
    get y() {
        return touches[this.index].y;
    }
    remove() {
        // code that is executed when the cursor disappears
    }
    
    static instances = [];
}
function updateChangesInTouches() {
    // save which cursors have already been processed
    let touchesFinished = new Array(touches.length).fill(false);
    let touchesLastFinished = new Array(touchesLast.length).fill(false);
    
    // calculate the distance between two cursors
    let distBetweenCursors = (index1, index2) => {
        let distX = touchesLast[index1].x-touches[index2].x;
        let distY = touchesLast[index1].y-touches[index2].y;
        let dist = Math.hypot(distX, distY);
        return dist;
    };
    
    // search the next cursor to the cursor previously being at index index1
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
    
    // search the cursors that have the minimum distance
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
        
        // calculate old and new cursor
        let data = allCursorsMinDist();
        
        // check if the nearest cursor to the calculated old cursor position is the same as the calculated new cursor
        if (data.dist == cursorMinDist(data.index1, false).dist && touchesFinished.indexOf(false) == -1) {
            
            // save that the cursor is finished
            touchesLastFinished[data.index1] = true;
            touchesFinished[data.index2] = true;
            
            // update Cursor instances
            for (let i = 0; i < Cursor.instances.length; i++) {
                if (Cursor.instances[i].index == data.index1) {
                    Cursor.instances[i].indexNew = data.index2;
                }
            }
            
            // call touchmove()
            touchmove(data.index1, data.index2);
        } else {
            // save that the cursor is finished
            touchesLastFinished[data.index1] = true;
            
            // call touchend()
            touchend(data.index1);
            
            // update Cursor instances
            for (let i = 0; i < Cursor.instances.length; i++) {
                if (Cursor.instances[i].index == data.index1) {
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
    }
    // finish updating moved Cursor instances
    for (let i = 0; i < Cursor.instances.length; i++) {
        if (Cursor.instances[i].indexNew !== undefined) {
            Cursor.instances[i].index = Cursor.instances[i].indexNew;
            Cursor.instances[i].indexNew = undefined;
        }
    }
    
    // iterate through the new Cursors
    for (let index2 = 0; index2 < touches.length; index2++) {
        if (touchesFinished[index2]) continue;
        
        // save that the cursor is finished (actually not necessary)
        touchesFinished[index2] = true;
        
        // call touchstart()
        touchstart(index2);
    }
    
    // update touchesLast
    touchesLast = JSON.copy(touches);
};