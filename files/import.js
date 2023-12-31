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