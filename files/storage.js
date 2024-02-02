let storage = {};
storage.numberBin = "000";
storage.bigIntBin = "001";
storage.simpleStringBin = "010";
storage.stringBin = "011";
storage.arrayBin = "100";
storage.objectBin = "101";
storage.functionBin = "110";
storage.otherBin = "111";
storage.simpleStringCharacters = " abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
storage.valueToBin = function(value) {
    let type = Object.prototype.toString.call(value);
    type = type.slice(8, -1);
    switch (type) {
        case "Number":   return storage.numberBin      +storage.numberToBin(value);
        case "BigInt":   return storage.bigIntBin      +storage.bigIntToBin(value);
        case "String": {
            for (let i = 0; i < value.length; i++) {
                if (storage.simpleStringCharacters.indexOf(value[i]) == -1) {
                         return storage.stringBin      +storage.stringToBin(value);
                }
            }
                         return storage.simpleStringBin+storage.simpleStringToBin(value);
        }
        case "Array":    return storage.arrayBin       +storage.arrayToBin(value);
        case "Object":   return storage.objectBin      +storage.objectToBin(value);
        case "Function": return storage.functionBin    +storage.functionToBin(value);
        case "Boolean":
        case "Undefined":
        case "Null":     return storage.otherBin       +storage.otherToBin(value);
        default: throw type+" is not a supported type";
    }
}
storage.binToValue = function(bin) {
    let type = bin.slice(0, 3);
    bin = bin.slice(3);
    switch (type) {
        case storage.numberBin:       return storage.binToNumber(bin);
        case storage.bigIntBin:       return storage.binToBigInt(bin);
        case storage.simpleStringBin: return storage.binToSimpleString(bin);
        case storage.stringBin:       return storage.binToString(bin);
        case storage.arrayBin:        return storage.binToArray(bin);
        case storage.objectBin:       return storage.binToObject(bin);
        case storage.functionBin:     return storage.binToFunction(bin);
        case storage.otherBin:        return storage.binToOther(bin);
        default: throw `Error: unknown type (${type})`;
    }
}
storage.bigIntToBin = function(bigInt) {
    let bin = "";
    while (bigInt > 0n) {
        let number = Number(bigInt%15n);
        bigInt /= 15n;
        let digitBin = number.toString(2);
        while (digitBin.length < 4) digitBin = "0"+digitBin;
        bin = digitBin+bin;
    }
    bin += "1111";
    return bin;
}
storage.binToBigInt = function(bin) {
    let bigInt = 0n;
    for (let i = 0; i < bin.length; i += 4) {
        let number = parseInt(bin.slice(i, i+4), 2);
        if (number == 15) return {result: bigInt, rest: bin.slice(i+4, bin.length)};
        else {
            bigInt *= 15n;
            bigInt += BigInt(number);
        }
    }
    throw "no bigInt end";
}
storage.numberToBin = function(number) {
    let bin = "";
    if (number == Infinity) return "100";
    if (number == -Infinity) return "101";
    if (number == 0) return "110";
    if (isNaN(number)) return "111";
    bin += "0";
    let sign = number < 0;
    if (sign) number = -number;
    bin += sign ? "1" : "0";
    let exponent = 0;
    while (number < 1) {
        number = number+number;
        exponent--;
    }
    while (number >= 2) {
        number = number/2;
        exponent++;
    }
    exponent += 1024;
    if (exponent < 0) return "110";
    if (exponent >= 2048) return sign ? "101" : "100";
    let exponentBin = exponent.toString(2);
    while (exponentBin.length < 11) exponentBin = "0"+exponentBin;
    bin += exponentBin;
    let digits = number-1;
    digits = Math.round(digits*(2**52));
    let digitsBin = digits.toString(2);
    while (digitsBin.length < 52) digitsBin = "0"+digitsBin;
    bin += digitsBin;
    return bin;
}
storage.binToNumber = function(bin) {
    if (bin[0] == "1") {
        switch (bin.slice(0, 3)) {
            case "100": return {result: Infinity, rest: bin.slice(3)};
            case "101": return {result: -Infinity, rest: bin.slice(3)};
            case "110": return {result: 0, rest: bin.slice(3)};
            case "111": return {result: NaN, rest: bin.slice(3)};
        }
    }
    bin = bin.slice(1);
    let sign = bin[0];
    let exponent = bin.slice(1, 12);
    let digits = bin.slice(12, 64);
    let number = 1+parseInt(digits, 2)/(2**52);
    number *= 2**(parseInt(exponent, 2)-1024);
    if (sign == "1") number = -number;
    return {result: number, rest: bin.slice(64)};
}
storage.simpleStringToBin = function(string) {
    let bin = "";
    for (let i = 0; i < string.length; i++) {
        let index = storage.simpleStringCharacters.indexOf(string[i]);
        if (index == -1) throw string[i]+" is not allowed";
        let indexBin = index.toString(2);
        while (indexBin.length < 6) indexBin = "0"+indexBin;
        bin += indexBin;
    }
    bin += "111111";
    return bin;
}
storage.binToSimpleString = function(bin) {
    let string = "";
    for (let i = 0; i < bin.length; i += 6) {
        let index = parseInt(bin.slice(i, i+6), 2);
        if (index == 0b111111) return {result: string, rest: bin.slice(i+6, bin.length)};
        else string += storage.simpleStringCharacters[index];
    }
    throw "no string end";
}
storage.stringToBin = function(string) {
    let bin = "";
    let uint8Array = new TextEncoder().encode(string);
    bin += storage.bigIntToBin(BigInt(uint8Array.length));
    for (let i = 0; i < uint8Array.length; i++) {
        let byte = uint8Array[i].toString(2);
        while (byte.length < 8) byte = "0"+byte;
        bin += byte;
    }
    return bin;
}
storage.binToString = function(bin) {
    let length = storage.binToBigInt(bin);
    bin = length.rest;
    length = Number(length.result);
    let uint8Array = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        uint8Array[i] = parseInt(bin.slice(0, 8), 2);
        bin = bin.slice(8);
    }
    let string = new TextDecoder().decode(uint8Array);
    return {result: string, rest: bin};
}
storage.arrayToBin = function(array) {
    let bin = storage.bigIntToBin(BigInt(array.length));
    for (let i = 0; i < array.length; i++) {
        bin += storage.valueToBin(array[i]);
    }
    return bin;
}
storage.binToArray = function(bin) {
    let length = storage.binToBigInt(bin);
    bin = length.rest;
    length = Number(length.result);
    let array = [];
    for (let i = 0; i < length; i++) {
        let value = storage.binToValue(bin);
        bin = value.rest;
        array.push(value.result);
    }
    return {result: array, rest: bin};
}
storage.objectToBin = function(object) {
    let keys = Object.keys(object);
    let bin = storage.bigIntToBin(BigInt(keys.length));
    for (let i = 0; i < keys.length; i++) {
        bin += storage.simpleStringToBin(keys[i]);
        bin += storage.valueToBin(object[keys[i]]);
    }
    return bin;
}
storage.binToObject = function(bin) {
    let length = storage.binToBigInt(bin);
    bin = length.rest;
    length = Number(length.result);
    let object = {};
    for (let i = 0; i < length; i++) {
        let key = storage.binToSimpleString(bin);
        bin = key.rest;
        key = key.result;
        let value = storage.binToValue(bin);
        bin = value.rest;
        value = value.result;
        object[key] = value;
    }
    return {result: object, rest: bin};
}
storage.functionToBin = function(fn) {
    return storage.stringToBin(fn.toString());
}
storage.binToFunction = function(bin) {
    let result = storage.binToString(bin);
    return {result: eval("("+result.result+")"), rest: result.rest};
}
storage.otherToBin = function(something) {
    if (something === undefined) return "00";
    if (something === null)      return "01";
    if (something === false)     return "10";
    if (something === true)      return "11";
}
storage.binToOther = function(bin) {
    if (bin.slice(0, 2) == "00") return {result: undefined, rest: bin.slice(2)};
    if (bin.slice(0, 2) == "01") return {result: null,      rest: bin.slice(2)};
    if (bin.slice(0, 2) == "10") return {result: false,     rest: bin.slice(2)};
    if (bin.slice(0, 2) == "11") return {result: true,      rest: bin.slice(2)};
}
storage.numbers2string = function(numbers) {
    data = [];
    for (let i = 0; i < numbers.length; i++) {
        let number = numbers[i];
        number += 32;
        if (number > 126) number += 33;
        if (number >= 55296) number += 2048;
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
storage.string2numbers = function(string) {
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
        if (numbers[i] >= 55296) numbers[i] -= 2048;
        if (numbers[i] > 126) numbers[i] -= 33;
        numbers[i] -= 32;
    }
    return numbers;
}
storage.read = function() {
    let numbers = storage.string2numbers(localStorage["Learning program"]);
    let number = 0n;
    for (let i = 0; i < numbers.length; i++) {
        number *= 1046463n;
        number += BigInt(numbers[i]);
    }
    let bin = number.toString(2).slice(1);
    storage.storage = storage.binToValue(bin).result;
}
storage.write = function() {
    let bin = "1"+storage.valueToBin(storage.storage);
    let number = 0n;
    for (let i = 0; i < bin.length; i++) {
        number <<= 1n;
        number += BigInt(bin[i]);
    }
    let numbers = [];
    while (number != 0n) {
        numbers.push(Number(number%1046463n));
        number /= 1046463n;
    }
    localStorage["Learning program"] = storage.numbers2string(numbers);
}
try {
    storage.read();
} catch {
    storage.storage = {};
    storage.write();
} finally {
    if (storage.storage.XP == undefined) storage.storage.XP = 0;
}