let commands = function(text, x = 0, y = 0, size = 0.1, font = chilanka) {
    
    // get the commands from opentype.js
    let cmd = font.getPath(text, 0, 0, size).commands;
    
    // search smallest and biggest x and y positions
    let minX = 0;
    let maxX = 0;
    let minY = 0;
    let maxY = 0;
    for (let i = 0; i < cmd.length; i++) {
        switch (cmd[i].type) {
            case "M": {
                minX = Math.min(minX, cmd[i].x);
                maxX = Math.max(maxX, cmd[i].x);
                minY = Math.min(minY, cmd[i].y);
                maxY = Math.max(maxY, cmd[i].y);
                break;
            }
            case "L": {
                minX = Math.min(minX, cmd[i].x);
                maxX = Math.max(maxX, cmd[i].x);
                minY = Math.min(minY, cmd[i].y);
                maxY = Math.max(maxY, cmd[i].y);
                break;
            }
            case "C": {
                minX = Math.min(minX, cmd[i].x1);
                maxX = Math.max(maxX, cmd[i].x1);
                minY = Math.min(minY, cmd[i].y1);
                maxY = Math.max(maxY, cmd[i].y1);
                minX = Math.min(minX, cmd[i].x2);
                maxX = Math.max(maxX, cmd[i].x2);
                minY = Math.min(minY, cmd[i].y2);
                maxY = Math.max(maxY, cmd[i].y2);
                minX = Math.min(minX, cmd[i].x);
                maxX = Math.max(maxX, cmd[i].x);
                minY = Math.min(minY, cmd[i].y);
                maxY = Math.max(maxY, cmd[i].y);
                break;
            }
            case "Q": {
                minX = Math.min(minX, cmd[i].x1);
                maxX = Math.max(maxX, cmd[i].x1);
                minY = Math.min(minY, cmd[i].y1);
                maxY = Math.max(maxY, cmd[i].y1);
                minX = Math.min(minX, cmd[i].x);
                maxX = Math.max(maxX, cmd[i].x);
                minY = Math.min(minY, cmd[i].y);
                maxY = Math.max(maxY, cmd[i].y);
                break;
            }
        }
    }
    
    // calculate the center of the text
    let centerx = (minX+maxX)/2-x;
    let centery = (minY+maxY)/2-y;
    
    // center text
    for (let i = 0; i < cmd.length; i++) {
        switch (cmd[i].type) {
            case "M": {
                cmd[i].x -= centerx;
                cmd[i].y -= centery;
                break;
            }
            case "L": {
                cmd[i].x -= centerx;
                cmd[i].y -= centery;
                break;
            }
            case "C": {
                cmd[i].x1 -= centerx;
                cmd[i].y1 -= centery;
                cmd[i].x2 -= centerx;
                cmd[i].y2 -= centery;
                cmd[i].x -= centerx;
                cmd[i].y -= centery;
                break;
            }
            case "Q": {
                cmd[i].x1 -= centerx;
                cmd[i].y1 -= centery;
                cmd[i].x -= centerx;
                cmd[i].y -= centery;
                break;
            }
        }
    }
    
    // return commands
    return cmd;
};