let delay = 0;
let drawnumber = 0;
let framerate = null;
let framerateint = Math.round(framerate);
let nextframerateintupdate = Date.now();
let pos = {x: 0, y: 0, z: 0};
let poslast = JSON.copy(pos);
let speed = {x: 0, y: 0, z: 0};
let speedlast = JSON.copy(speed);
let rot = {x: 0, y: 0, z: 0};
let direction = {x: 0, y: 0, z: 0};
let time = Date.now();
let controlCursor = null;
let controlSpeed = 2;

function draw() {
    drawnumber++;
    
    updateTime();
    
    // save storage
    storage.write();
    
    // clear the canvas
    cnew();
    
    // set linetype of canvas to "round"
    clinetype(true);
    
    if (state == "not started") {
        drawStartSquare();
    } else if (state == "start") {
        cb();
        crect(-0.9, -0.9, 1.8, 1.8);
        cstrk(0.015, "#000");
        cstrk(0.010, "#888");
        cstrk(0.005, "#fff");
        cc();
        cb();
        ctext(commands("start", 0, -0.3, 0.3));
        ctext(commands(""+taskNumber, 0, 0, 0.3));
        ctext(commands("task"+(taskNumber==1?"":"s"), 0, 0.3, 0.3));
        cstrk(0.015, "#000");
        cfill("#fff");
        cstrk(0.005);
        cc();
    } else if (state == "learning") {
        updatePosition();
        drawPercent();
        for (let z = tasks.length; z > 0; z--) {
            xyzloc.z = z*taskDist;
            checkIfTaskCompleted(z);
            let viewDist = xyztransform({x:0,y:0,z:0}).z;
            if (z == tasks.length && viewDist < -taskDist) {
                state = "start";
                pos = {x: 0, y: 0, z: 0};
            }
            drawTask(z);
        }
        drawControl();
        drawPaperPlane();
    }
    
    drawFrameRate();
    
    PaintedCursor.draw();
    
    let calculateTime = (Date.now()-time)/1000;
    let waitTime = 1/maxfps-calculateTime;
    waitTime*= 1000;
    waitTime = Math.max(waitTime, 0);
    waitTime = Math.round(waitTime);
    setTimeout(draw, waitTime);
}
function updateTime() {
    // calculate delay
    delay = Date.now()-time;
    time += delay;
    delay /= 1000; // convert to seconds
    
    // update framerate variables
    if (framerate == Infinity) framerate = 1/delay;
    else if (drawnumber < 10) framerate = 1/delay;
    else framerate = framerate*0.98+1/delay*0.02;
    if ((nextframerateintupdate <= Date.now()) && (framerateint != Math.round(framerate))) {
        framerateint = Math.round(framerate);
        nextframerateintupdate = Date.now()+500; // refresh in half a second at the earliest
    }
    
    // make everything faster or slower
    delay *= tasksSpeed;
}
function drawFrameRate() {
    cb();
    let fpstext = numbertotext(framerateint)+" fps";
    if (cw > ch) ctext(commands(fpstext, -cw/ch+0.20, -1+0.14, 0.05));
    else ctext(commands(fpstext, -1+0.20, -ch/cw+0.14, 0.05));
    cstrk(0.01, "#0008");
    cfill("#fff");
    cc();
}
function drawStartSquare() {
    cb();
    crect(-0.9, -0.9, 1.8, 1.8);
    cfill(chsl(Date.now()/10000%1));
    cc();
    cb();
    ctext(commands("Start!", 0, 0, 0.4));
    cstrk(0.015, "#000");
    cfill("#fff");
    cstrk(0.005);
    cc();
}
function updatePosition() {
    // move forward
    speed.z = 2;
    
    // smooth movements
    speed.x = speed.x*0.1+speedlast.x*0.9;
    speed.y = speed.y*0.1+speedlast.y*0.9;
    speed.z = speed.z*0.1+speedlast.z*0.9;
    
    // update poslast and speedlast
    poslast = JSON.copy(pos);
    speedlast = JSON.copy(speed);
    
    // prevent movement out of the area
    if (speed.x < 0) speed.x*= pos.x+1;
    else speed.x*= 1-pos.x;
    if (speed.y < 0) speed.y*= pos.y+1;
    else speed.y*= 1-pos.y;
    
    // update flight direction
    direction = JSON.copy(speed);
    
    // update pos
    pos.x+= speed.x*delay;
    pos.y+= speed.y*delay;
    pos.z+= speed.z*delay;
    
    // reset speed
    speed = {x: 0, y: 0, z: 0};
}
function checkIfTaskCompleted(z) {
    let task = tasks[z-1];
    if (xyzloc.z-4 < pos.z && !task.completed) {
        task.completed = true;
        let x = Math.round(pos.x+0.5);
        let y = Math.round(pos.y+0.5);
        let i = x+2*y;
        tasks[z-1].answer = tasks[z-1].possibilities[i];
        if (tasks[z-1].possibilities[i] == tasks[z-1].solution) {
            let answers = [
                `Well done! ${(tasks[z-1].solution)}  is correct!`,
                `Well done! ${(tasks[z-1].solution)} is the right answer!`,
                `Well done! ${(tasks[z-1].solution)} is right!`,
                `Perfect! ${(tasks[z-1].solution)}  is correct!`,
                `Perfect! ${(tasks[z-1].solution)} is the right answer!`,
                `Correct! ${(tasks[z-1].solution)} is the right answer!`,
                `Correct! ${(tasks[z-1].solution)} is right!`,
                `Great! ${(tasks[z-1].solution)} is correct!`,
                `Great! ${(tasks[z-1].solution)} is right!`
            ];
            console.log(answers.random());
            storage.storage.XP++;
        } else {
            let answers = [
                `${tasks[z-1].possibilities[i]} is incorrect. The correct solution would have been ${tasks[z-1].solution}.`,
                `${tasks[z-1].possibilities[i]} is incorrect. ${tasks[z-1].solution} would have been the correct solution.`,
                `${tasks[z-1].possibilities[i]} is wrong. The correct solution would have been ${tasks[z-1].solution}.`,
                `${tasks[z-1].possibilities[i]} is not correct. The correct solution would have been ${tasks[z-1].solution}.`,
                `${tasks[z-1].possibilities[i]} is not correct. ${tasks[z-1].solution} would have been the correct solution.`,
                `${tasks[z-1].possibilities[i]} is not correct. The answer would have been ${tasks[z-1].solution}.`,
                `${tasks[z-1].possibilities[i]} is wrong. ${tasks[z-1].solution} would have been the answer.`,
                `${tasks[z-1].possibilities[i]} is wrong. The correct answer would have been ${tasks[z-1].solution}.`,
                `${tasks[z-1].possibilities[i]} is sadly incorrect. The correct solution would be ${tasks[z-1].solution}.`,
                `${tasks[z-1].possibilities[i]} is unfortunately incorrect. ${tasks[z-1].solution} would have been the correct solution.`,
                `${tasks[z-1].possibilities[i]} is unfortunately incorrect. The correct solution was ${tasks[z-1].solution}.`,
                `The answer ${tasks[z-1].possibilities[i]} is incorrect. The correct solution would have been ${tasks[z-1].solution}.`,
                `The answer ${tasks[z-1].possibilities[i]} is false. The correct solution would have been ${tasks[z-1].solution}.`,
                `The answer ${tasks[z-1].possibilities[i]} is incorrect. The correct solution was ${tasks[z-1].solution}.`,
                `Your answer ${tasks[z-1].possibilities[i]} is wrong. ${tasks[z-1].solution} would have been the correct solution.`
            ];
            console.log(answers.random());
            task.repeat();
        }
    }
}
function drawTask(z) {
    let task = tasks[z-1];
    let viewDist = xyztransform({x:0,y:0,z:0}).z;
    
    // calculate alpha
    let alpha = viewDist/3-0.2;
    if (viewDist > taskDist) alpha = (taskDist-viewDist+4)/3-0.2;
    alpha = alpha.clamp();
    
    // draw task
    if (alpha > 0) {
        // draw white border around options
        cb();
        xyzpolygon(xyzsquare(2.1, 0, 0));
        cfill(crgba(1, 1, 1, alpha));
        cc();
        
        // write task and hint
        cb();
        xyztext(commands(task.textAbove, 0, -1.2, 0.2));
        xyztext(commands(task.textBelow, 0, 1.2, 0.2));
        cstrk(0.20/viewDist, crgba(0, 0, 0, alpha));
        cstrk(0.10/viewDist, crgba(0.5, 0.5, 0.5, alpha));
        cfill(crgba(1, 1, 1, alpha));
        cc();
        
        for (let x = -0.5; x < 1.5; x++) {
            for (let y = -0.5; y < 1.5; y++) {
                // calculate index
                let i = Math.round(x+0.5)+2*Math.round(y+0.5);
                
                // draw area with option
                cb();
                xyzpolygon(xyzsquare(1, x, y));
                if (task.completed) {
                    if (task.possibilities[i] == task.solution) cfill(crgba(0, 1, 0, alpha));
                    else cfill(crgba(1, 0, 0, alpha));
                } else cfill(crgba(0, 0, 1, alpha));
                cstrk(0.1/viewDist, crgba(0, 0, 0, alpha));
                cc();
                
                // write possibility
                cb();
                xyztext(commands(task.possibilities[i], x, y, 1));
                cstrk(0.25/viewDist, crgba(0, 0, 0, alpha));
                cstrk(0.15/viewDist, crgba(0.5, 0.5, 0.5, alpha));
                cstrk(0.05/viewDist, crgba(1, 1, 1, alpha));
                cc();
            }
        }
    }
}
function drawControl() {
    // calculate the position of the control and save the position and size to variables
    let controlX = 0.3-cw/cm;
    let controlY = ch/cm-0.3;
    let controlRadius = 0.2;
    
    // draw the outer control circle
    cb();
    carc(controlX, controlY, controlRadius);
    cfill("#fff8");
    cstrk(0.02, "#fff8");
    cstrk(0.01, "#fff");
    cc();
    
    // declare the cursor position
    let cursorX, cursorY;
    
    // define the cursor position
    if (controlCursor == null) {
        // if there is no control cursor, the cursor position is the center of the control circle
        cursorX = controlX;
        cursorY = controlY;
    } else {
        // convert the position of the cursor from pixels to the unit of measurement of controlX, controlY and controlRadius
        cursorX = (controlCursor.x-cw2)/cm2;
        cursorY = (controlCursor.y-ch2)/cm2;
    }
    
    // calculate the distance and angle between the cursor and the control
    let dx = cursorX-controlX;
    let dy = cursorY-controlY;
    let dist = Math.hypot(dy, dx);
    let angle = Math.atan2(dy, dx);
    
    // limit the value of dist to provent too fast movement
    if (dist > controlRadius) dist = controlRadius;
    
    // calculate a factor for the speed that allows precise and fast movements
    let factor = Math.sin(dist/controlRadius*Math.PI/2)**2;
    factor *= controlSpeed;
    
    // update the speed
    speed.x+= Math.cos(angle)*factor;
    speed.y+= Math.sin(angle)*factor;
    
    // because the inner control circle should not move out of the outer circle, limit the value of dist again
    if (dist > controlRadius/3) dist = controlRadius/3;
    
    // calculate the position of the inner control circle
    let controlCircleX = Math.cos(angle)*dist;
    let controlCircleY = Math.sin(angle)*dist;
    
    // draw the inner control circle
    cb();
    carc(controlX+controlCircleX, controlY+controlCircleY, controlRadius/2);
    cfill("#fff8");
    cstrk(0.02, "#fff8");
    cstrk(0.01, "#fff");
    cc();
}
function drawPercent() {
    xyzloc.z = (tasks.length+1)*taskDist;
    let viewDist = xyztransform({x:0,y:0,z:0}).z;
    let alpha = viewDist/3-0.2;
    let accuracy = taskNumber/tasks.length;
    cb();
    xyztext(commands(Math.round(accuracy*100)+"% were correct", 0, 0, 0.2));
    cstrk(0.20/viewDist, crgba(0, 0, 0, alpha));
    cstrk(0.10/viewDist, crgba(0.5, 0.5, 0.5, alpha));
    cfill(crgba(1, 1, 1, alpha));
    cc();
}
function drawPaperPlane() {
    xyzloc.x = pos.x;
    xyzloc.y = pos.y;
    xyzloc.z = pos.z+1;
    xyzrot.x = -direction.y/10;
    xyzrot.y = direction.x/10;
    
    // triangle faces
    let p1 = [{x: .01, y:0, z:0}, {x: .06, y:0,    z:0}, {x:0, y:0, z:0.5}];
    let p2 = [{x:-.01, y:0, z:0}, {x:-.06, y:0,    z:0}, {x:0, y:0, z:0.5}];
    let p3 = [{x: .01, y:0, z:0}, {x:  0,  y:0.03, z:0}, {x:0, y:0, z:0.5}];
    let p4 = [{x:-.01, y:0, z:0}, {x:  0,  y:0.03, z:0}, {x:0, y:0, z:0.5}];
    
    // functions drawing the triangles
    let f12 = function() {
        cb();
        xyzpolygon(p1);
        xyzpolygon(p2);
        cfill("#eee");
        cstrk(0.01, "#111");
        cc();
    };
    let f3 = function() {
        cb();
        xyzpolygon(p3);
        cfill("#eee");
        cstrk(0.01, "#111");
        cc();
    };
    let f4 = function() {
        cb();
        xyzpolygon(p4);
        cfill("#eee");
        cstrk(0.01, "#111");
        cc();
    };
    
    // draw the triangles in the correct order
    if (xyzrot.x < 0) {
        f12();
    }
    if (xyzrot.y < 0) {
        f3();
        f4();
    } else {
        f4();
        f3();
    }
    if (xyzrot.x >= 0) {
        f12();
    }
    
    
    xyzreset();
}