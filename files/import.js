function numbers2string(numbers) {
    data = [];
    for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];
        if (number > 126) number += 33;
        number += 32;
        let digits = number.toString(2);
        let bytes = [];
        if (number < 2**7) {
            while (digits.length < 7) digits = "0"+digits;
            bytes[0] = "0"+digits.slice(0, 7);
        } else if (number < 2**11) {
            while (digits.length < 11) digits = "0"+digits;
            bytes[0] = "110"+digits.slice(0,  5);
            bytes[1] = "10" +digits.slice(5, 11);
        } else if (number < 2**16) {
            while (digits.length < 16) digits = "0"+digits;
            bytes[0] = "1110"+digits.slice(0,   4);
            bytes[1] = "10"  +digits.slice(4,  10);
            bytes[2] = "10"  +digits.slice(10, 16);
        } else if (number < 2**20) {
            while (digits.length < 21) digits = "0"+digits;
            bytes[0] = "11110"+digits.slice(0,   3);
            bytes[1] = "10"   +digits.slice(3,   9);
            bytes[2] = "10"   +digits.slice(9,  15);
            bytes[3] = "10"   +digits.slice(15, 21);
        } else throw "digitsCount is too large";
        data.push(bytes);
    }
    data = [].concat(...data);
    let array = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) array[i] = parseInt(data[i], 2);
    let characters = new TextDecoder().decode(array);
    return characters;
}
function string2numbers(string) {
    let array = new TextEncoder().encode(string);
    let data = new Array(array.length);
    for (let i = 0; i < array.length; i++) {
		data[i] = array[i].toString(2);
		while(data[i].length < 8) data[i] = "0"+data[i];
    }
    let numbers = [];
    for (let i = 0; i < data.length; i++) {
        let startBit = data[i].indexOf("0")+1;
        let number = data[i].slice(startBit, 8);
        if (data[i].slice(0, 2) == "10") {
            numbers[numbers.length-1] <<= number.length;
            numbers[numbers.length-1] += parseInt(number, 2);
        } else {
            numbers.push(parseInt(number, 2));
        }
    }
    for (let i = 0; i < numbers.length; i++) {
        numbers[i] -= 32;
        if (numbers[i] > 126) numbers[i] -= 33;
    }
    return numbers;
}
async function loadImageURL(URL) {
    //create img element and load URL
    let img = document.createElement("img");
    let imgPromise = new Promise(resolve => {
        img.addEventListener("load", resolve);
    });
    img.src = URL;
    img.style.display = "none";
    document.body.appendChild(img);
    
    // wait for img to load
    await imgPromise;
    
    // create canvas element
    let canvasTMP = document.createElement("canvas");
    canvasTMP.width = img.width;
    canvasTMP.height = img.height;
    canvasTMP.style.display = "none";
    document.body.appendChild(canvasTMP);
    let ctxTMP = canvasTMP.getContext("2d");
    
    // draw image on canvas
    ctxTMP.drawImage(img, 0, 0);
    
    // read data from canvas and save width and height
    let data = ctxTMP.getImageData(0, 0, canvasTMP.width, canvasTMP.height).data;
    let width = canvasTMP.width;
    let height = canvasTMP.height;
    
    // delete elements
    img.remove();
    canvasTMP.remove();
    
    // return data
    return new SimpleImage(data, width, height, "32 Bit Uint8Array");
}
class SimpleImage {
    constructor(data, width, height, type) {
        this.width = width;
        this.height = height;
        this.data = data;
        this.type = type;
    }
    changeType(type) {
        if (this.type == "32 Bit Uint8Array" && type == "1 Bit Uint32Array") {
            let dataNew = new Uint32Array(Math.ceil(this.width*this.height/32));
            for (let i = 0; i < this.data.length; i+= 4) {
                let x = (i/4)%this.width;
                let y = (i/4-x)/this.width;
                let brightnessRGB = (this.data[i]+this.data[i+1]+this.data[i+2])/3/256;
                let brightnessRGBA = brightnessRGB*this.data[i+3]/256;
                dataNew[Math.floor(i/4/32)] <<= 1;
                if (brightnessRGBA > 0.5) dataNew[Math.floor(i/4/32)]++;
            }
            this.data = dataNew;
            this.type = type;
        } else {
            throw `cannot switch from "${this.type}" to "${type}"`;
        }
    }
}
function getImagePixel(name, x, y) {
    if (!images[name]) throw "image does not exist";
    x *= images[name].width;
    y *= images[name].height;
    x %= images[name].width;
    y %= images[name].height;
    if (x < 0) x += images[name].width;
    if (y < 0) y += images[name].height;
    x = Math.round(x);
    y = Math.round(y);
    let index = x+images[name].width*y;
    return Boolean(images[name].data[Math.floor(index/32)] & (1<<(31-index%32)));
}
let chilanka = null;
async function loadFont() {
    let fontURL = "./files/Chilanka-Regular.otf";
    let fetchResult = await fetch(fontURL);
    let blob = await fetchResult.blob();
    let arrayBuffer = await new Promise(resolve => {
        let reader = new FileReader();
        reader.onload = () => {resolve(reader.result)};
        reader.readAsArrayBuffer(blob);
    });
    chilanka = opentype.parse(arrayBuffer);
}
let images = {};