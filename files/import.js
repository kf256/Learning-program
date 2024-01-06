let ab2str = function(buf) {
    return String.fromCharCode.apply(null, new Uint16Array(buf));
};
let str2ab = function(str) {
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i<strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
};
let UTF8_bin = function() {
    ergebnis = "";
    for (let i = 0; i < 512; i++) {
        if (i < 2**7) {
            ergebnis += "0";
            let ziffern = i.toString(2);
            while (ziffern.length < 7) ziffern = "0"+ziffern;
            ergebnis += ziffern;
        } else if (i < 2**11) {
            ergebnis += "110";
            let ziffern = i.toString(2);
            while (ziffern.length < 11) ziffern = "0"+ziffern;
            ergebnis += ziffern.slice(0, 5);
            ergebnis += "10";
            ergebnis += ziffern.slice(5, 11);
        } else throw "i is too large";
    }
};
let utf8 = ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_abcdefghijklmnopqrstuvwxyz{|}~ ¡¢£¤¥¦§¨©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖ×ØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõö÷øùúûüýþÿĀāĂăĄąĆćĈĉĊċČčĎďĐđĒēĔĕĖėĘęĚěĜĝĞğĠġĢģĤĥĦħĨĩĪīĬĭĮįİıĲĳĴĵĶķĸĹĺĻļĽľĿŀŁłŃńŅņŇňŉŊŋŌōŎŏŐőŒœŔŕŖŗŘřŚśŜŝŞşŠšŢţŤťŦŧŨũŪūŬŭŮůŰűŲųŴŵŶŷŸŹźŻżŽžſƀƁƂƃƄƅƆƇƈƉƊƋƌƍƎƏƐƑƒƓƔƕƖƗƘƙƚƛƜƝƞƟƠơƢƣƤƥƦƧƨƩƪƫƬƭƮƯưƱƲƳƴƵƶƷƸƹƺƻƼƽƾƿǀǁǂǃǄǅǆǇǈǉǊǋǌǍǎǏǐǑǒǓǔǕǖǗǘǙǚǛǜǝǞǟǠǡǢǣǤǥǦǧǨǩǪǫǬǭǮǯǰǱǲǳǴǵǶǷǸǹǺǻǼǽǾǿ`;
let encodeImage = function(data) {
    let number = 0;
    let character = data[0];
    let result = "";
    for (let i = 0; i < data.length; i++) {
        if (data[i] != "0" && data[i] != "1") throw `Unexpected "${data[i]}": only "0" and "1" allowed`;
        if (data[i] == character) number++;
        else {
            result+= utf8[number];
            number = 1;
            character = data[i];
            continue;
        }
        if (number == utf8.length) {
            result+= utf8[number-1];
            result+= utf8[0];
            number = 1;
        }
    }
    result+= utf8[number];
    return result;
};
let decodeImage = function(data) {
    let string = "";
    for (let i = 0; i < data.length; i++) {
        string += (""+i%2).repeat(utf8.indexOf(data[i]));
    }
    let array = new Uint32Array(Math.ceil(string.length/32));
    for (let i = 0; i < array.length; i++) {
        array[i] = 0;
        for (let j = 0; j < 32; j++) {
            if (j) array[i] <<= 1;
            if (string[i*32+j] == "1") array[i]++;
        }
    }
    return array;
};
async function loadImageURL(URL) {
    //create img element and load URL
    let img = document.createElement("img");
    let imgPromise = new Promise(resolve => {
        img.addEventListener("load", resolve);
    });
    img.src = URL;
    document.body.appendChild(img);
    
    // wait for img to load
    await imgPromise;
    
    // create canvas element
    let canvasTMP = document.createElement("canvas");
    canvasTMP.width = img.width;
    canvasTMP.height = img.height;
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
    let image = new SimpleImage(width, height, data);
    image.changeType("1 Bit Uint32Array");
    return image;
}
class SimpleImage {
    constructor(width, height, data) {
        this.width = width;
        this.height = height;
        this.data = data;
        this.type = "32 Bit Uint8Array";
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
let getImagePixel = function(name, x, y) {
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
};
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