!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.bndl=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = {
    decode: require('./src/decode'),
    encode: require('./src/encode')
};
},{"./src/decode":2,"./src/encode":3}],2:[function(require,module,exports){
"use strict";

function decode (arrayBuffer) {
    var uint8 = new Uint8Array(arrayBuffer),
        magic = (uint8[0] << 24) + (uint8[1] << 16) + (uint8[2] << 8) + uint8[3],
        version = uint8[4],
        numberOfFiles = uint8[5] + (uint8[6] << 8)  + (uint8[7] << 16);

    /** PRELIMINARY CHECKS **/

    if (magic !== 0x424E444C){
        throw new Error('BNDL decoder: Invalid magic number');
    }

    if (version === 0) {
        throw new Error('BNDL decoder: Invalid format version: ' + version);
    } else if (version !== 0x01) {
        throw new Error('BNDL decoder: Unsupported format version: ' + version);
    }

    if (numberOfFiles === 0) {
        throw new Error('BNDL decoder: Invalid number of files: 0');
    }

    /** PARSING **/

    var files = {},
        pos = 8,
        name,
        type,
        start,
        length,
        value,
        i;

    for (i = 0; i < numberOfFiles; i++) {
        name = '';
        type = '';
        start = 0;
        length = 0;

        while(pos < uint8.length) {
            value = uint8[pos];
            pos++;

            if (value === 0x00) {
                break;
            } else {
                name += String.fromCharCode(value);
            }
        }

        while(pos < uint8.length) {
            value = uint8[pos];
            pos++;

            if (value === 0x00) {
                break;
            } else {
                type += String.fromCharCode(value);
            }
        }

        start = uint8[pos] + (uint8[pos + 1] << 8) + (uint8[pos + 2] << 16) + (uint8[pos + 3] << 24);
        pos+=4;
        length = uint8[pos] + (uint8[pos + 1] << 8) + (uint8[pos + 2] << 16) + (uint8[pos + 3] << 24);
        pos+=4;

        files[name] = {
            type: type,
            start: start,
            length: length
        };
    }

    return {
        arrayBuffer: arrayBuffer,
        files: files
    };
}

module.exports = decode;
},{}],3:[function(require,module,exports){
"use strict";

function encode (data) {
    var ids = Object.keys(data),
        numberOfFiles = ids.length,
        fileStarts = new Array(numberOfFiles),
        size = 8, // magic(4) + version(1) + file number(3)
        i;

    if (numberOfFiles === 0) {
        throw new Error('BNDL encoder: Must contain at least one file');
    } else if (numberOfFiles > 0xFFFFFF) {
        throw new Error('BNDL encoder: Must contain less than 16777215 files');
    }

    for (i = 0; i < numberOfFiles; i++) {
        size += (
            ids[i].length + // id
            data[ids[i]].type.length + // type
            10 // id null(1) + type null (1) + start(4) + bytesize(4)
        );
    }

    for (i = 0; i < numberOfFiles; i++) {
        size = Math.ceil(size / 4) * 4; // pad to multiple of four
        fileStarts[i] = size;
        size+= data[ids[i]].data.byteLength;
    }

    var arrayBuffer = new ArrayBuffer(size),
        uint8 = new Uint8Array(arrayBuffer),
        pos = 8,
        file,
        start,
        fileSize,
        id,
        k;

    //magic "BNDL"
    uint8[0] = 0x42;
    uint8[1] = 0x4E;
    uint8[2] = 0x44;
    uint8[3] = 0x4C;

    // version
    uint8[4] = 0x01;

    // number of files
    uint8[5] = ids.length & 0xFF;
    uint8[6] = ids.length >> 8 & 0xFF;
    uint8[7] = ids.length >> 16 & 0xFF;

    pos = 8;

    for (i = 0; i < numberOfFiles; i++) {
        id = ids[i];
        file = data[id];

        for (k = 0; k < id.length; k++) {
            uint8[pos] = (id.charCodeAt(k) <= 0x7F ? id.charCodeAt(k) : 0x5F); // default to underscore
            pos++;
        }

        uint8[pos] = 0x00;
        pos++;

        for (k = 0; k < file.type.length; k++) {
            uint8[pos] = (file.type.charCodeAt(k) <= 0x7F ? file.type.charCodeAt(k) : 0x5F); // default to underscore
            pos++;
        }

        uint8[pos] = 0x00;
        pos++;

        // include start pos
        start = fileStarts[i];

        uint8[pos] = start & 0xFF;
        uint8[pos + 1] = start >> 8 & 0xFF;
        uint8[pos + 2] = start >> 16 & 0xFF;
        uint8[pos + 3] = start >> 24 & 0xFF;
        pos += 4;

        fileSize = file.data.byteLength;

        uint8[pos] = fileSize & 0xFF;
        uint8[pos + 1] = fileSize >> 8 & 0xFF;
        uint8[pos + 2] = fileSize >> 16 & 0xFF;
        uint8[pos + 3] = fileSize >> 24 & 0xFF;
        pos += 4;

        uint8.set(new Uint8Array(file.data), start);
    }

    return arrayBuffer;
}

module.exports = encode;
},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImluZGV4LmpzIiwic3JjL2RlY29kZS5qcyIsInNyYy9lbmNvZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuICAgIGRlY29kZTogcmVxdWlyZSgnLi9zcmMvZGVjb2RlJyksXG4gICAgZW5jb2RlOiByZXF1aXJlKCcuL3NyYy9lbmNvZGUnKVxufTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gZGVjb2RlIChhcnJheUJ1ZmZlcikge1xuICAgIHZhciB1aW50OCA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSxcbiAgICAgICAgbWFnaWMgPSAodWludDhbMF0gPDwgMjQpICsgKHVpbnQ4WzFdIDw8IDE2KSArICh1aW50OFsyXSA8PCA4KSArIHVpbnQ4WzNdLFxuICAgICAgICB2ZXJzaW9uID0gdWludDhbNF0sXG4gICAgICAgIG51bWJlck9mRmlsZXMgPSB1aW50OFs1XSArICh1aW50OFs2XSA8PCA4KSAgKyAodWludDhbN10gPDwgMTYpO1xuXG4gICAgLyoqIFBSRUxJTUlOQVJZIENIRUNLUyAqKi9cblxuICAgIGlmIChtYWdpYyAhPT0gMHg0MjRFNDQ0Qyl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBJbnZhbGlkIG1hZ2ljIG51bWJlcicpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBJbnZhbGlkIGZvcm1hdCB2ZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gICAgfSBlbHNlIGlmICh2ZXJzaW9uICE9PSAweDAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBVbnN1cHBvcnRlZCBmb3JtYXQgdmVyc2lvbjogJyArIHZlcnNpb24pO1xuICAgIH1cblxuICAgIGlmIChudW1iZXJPZkZpbGVzID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBJbnZhbGlkIG51bWJlciBvZiBmaWxlczogMCcpO1xuICAgIH1cblxuICAgIC8qKiBQQVJTSU5HICoqL1xuXG4gICAgdmFyIGZpbGVzID0ge30sXG4gICAgICAgIHBvcyA9IDgsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBsZW5ndGgsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG51bWJlck9mRmlsZXM7IGkrKykge1xuICAgICAgICBuYW1lID0gJyc7XG4gICAgICAgIHR5cGUgPSAnJztcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgICBsZW5ndGggPSAwO1xuXG4gICAgICAgIHdoaWxlKHBvcyA8IHVpbnQ4Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsdWUgPSB1aW50OFtwb3NdO1xuICAgICAgICAgICAgcG9zKys7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMHgwMCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuYW1lICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUocG9zIDwgdWludDgubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVpbnQ4W3Bvc107XG4gICAgICAgICAgICBwb3MrKztcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAweDAwKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHR5cGUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdGFydCA9IHVpbnQ4W3Bvc10gKyAodWludDhbcG9zICsgMV0gPDwgOCkgKyAodWludDhbcG9zICsgMl0gPDwgMTYpICsgKHVpbnQ4W3BvcyArIDNdIDw8IDI0KTtcbiAgICAgICAgcG9zKz00O1xuICAgICAgICBsZW5ndGggPSB1aW50OFtwb3NdICsgKHVpbnQ4W3BvcyArIDFdIDw8IDgpICsgKHVpbnQ4W3BvcyArIDJdIDw8IDE2KSArICh1aW50OFtwb3MgKyAzXSA8PCAyNCk7XG4gICAgICAgIHBvcys9NDtcblxuICAgICAgICBmaWxlc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICBsZW5ndGg6IGxlbmd0aFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGFycmF5QnVmZmVyOiBhcnJheUJ1ZmZlcixcbiAgICAgICAgZmlsZXM6IGZpbGVzXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWNvZGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGVuY29kZSAoZGF0YSkge1xuICAgIHZhciBpZHMgPSBPYmplY3Qua2V5cyhkYXRhKSxcbiAgICAgICAgbnVtYmVyT2ZGaWxlcyA9IGlkcy5sZW5ndGgsXG4gICAgICAgIGZpbGVTdGFydHMgPSBuZXcgQXJyYXkobnVtYmVyT2ZGaWxlcyksXG4gICAgICAgIHNpemUgPSA4LCAvLyBtYWdpYyg0KSArIHZlcnNpb24oMSkgKyBmaWxlIG51bWJlcigzKVxuICAgICAgICBpO1xuXG4gICAgaWYgKG51bWJlck9mRmlsZXMgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGVuY29kZXI6IE11c3QgY29udGFpbiBhdCBsZWFzdCBvbmUgZmlsZScpO1xuICAgIH0gZWxzZSBpZiAobnVtYmVyT2ZGaWxlcyA+IDB4RkZGRkZGKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBlbmNvZGVyOiBNdXN0IGNvbnRhaW4gbGVzcyB0aGFuIDE2Nzc3MjE1IGZpbGVzJyk7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IG51bWJlck9mRmlsZXM7IGkrKykge1xuICAgICAgICBzaXplICs9IChcbiAgICAgICAgICAgIGlkc1tpXS5sZW5ndGggKyAvLyBpZFxuICAgICAgICAgICAgZGF0YVtpZHNbaV1dLnR5cGUubGVuZ3RoICsgLy8gdHlwZVxuICAgICAgICAgICAgMTAgLy8gaWQgbnVsbCgxKSArIHR5cGUgbnVsbCAoMSkgKyBzdGFydCg0KSArIGJ5dGVzaXplKDQpXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZm9yIChpID0gMDsgaSA8IG51bWJlck9mRmlsZXM7IGkrKykge1xuICAgICAgICBzaXplID0gTWF0aC5jZWlsKHNpemUgLyA0KSAqIDQ7IC8vIHBhZCB0byBtdWx0aXBsZSBvZiBmb3VyXG4gICAgICAgIGZpbGVTdGFydHNbaV0gPSBzaXplO1xuICAgICAgICBzaXplKz0gZGF0YVtpZHNbaV1dLmRhdGEuYnl0ZUxlbmd0aDtcbiAgICB9XG5cbiAgICB2YXIgYXJyYXlCdWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoc2l6ZSksXG4gICAgICAgIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpLFxuICAgICAgICBwb3MgPSA4LFxuICAgICAgICBmaWxlLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgZmlsZVNpemUsXG4gICAgICAgIGlkLFxuICAgICAgICBrO1xuXG4gICAgLy9tYWdpYyBcIkJORExcIlxuICAgIHVpbnQ4WzBdID0gMHg0MjtcbiAgICB1aW50OFsxXSA9IDB4NEU7XG4gICAgdWludDhbMl0gPSAweDQ0O1xuICAgIHVpbnQ4WzNdID0gMHg0QztcblxuICAgIC8vIHZlcnNpb25cbiAgICB1aW50OFs0XSA9IDB4MDE7XG5cbiAgICAvLyBudW1iZXIgb2YgZmlsZXNcbiAgICB1aW50OFs1XSA9IGlkcy5sZW5ndGggJiAweEZGO1xuICAgIHVpbnQ4WzZdID0gaWRzLmxlbmd0aCA+PiA4ICYgMHhGRjtcbiAgICB1aW50OFs3XSA9IGlkcy5sZW5ndGggPj4gMTYgJiAweEZGO1xuXG4gICAgcG9zID0gODtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkZpbGVzOyBpKyspIHtcbiAgICAgICAgaWQgPSBpZHNbaV07XG4gICAgICAgIGZpbGUgPSBkYXRhW2lkXTtcblxuICAgICAgICBmb3IgKGsgPSAwOyBrIDwgaWQubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHVpbnQ4W3Bvc10gPSAoaWQuY2hhckNvZGVBdChrKSA8PSAweDdGID8gaWQuY2hhckNvZGVBdChrKSA6IDB4NUYpOyAvLyBkZWZhdWx0IHRvIHVuZGVyc2NvcmVcbiAgICAgICAgICAgIHBvcysrO1xuICAgICAgICB9XG5cbiAgICAgICAgdWludDhbcG9zXSA9IDB4MDA7XG4gICAgICAgIHBvcysrO1xuXG4gICAgICAgIGZvciAoayA9IDA7IGsgPCBmaWxlLnR5cGUubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIHVpbnQ4W3Bvc10gPSAoZmlsZS50eXBlLmNoYXJDb2RlQXQoaykgPD0gMHg3RiA/IGZpbGUudHlwZS5jaGFyQ29kZUF0KGspIDogMHg1Rik7IC8vIGRlZmF1bHQgdG8gdW5kZXJzY29yZVxuICAgICAgICAgICAgcG9zKys7XG4gICAgICAgIH1cblxuICAgICAgICB1aW50OFtwb3NdID0gMHgwMDtcbiAgICAgICAgcG9zKys7XG5cbiAgICAgICAgLy8gaW5jbHVkZSBzdGFydCBwb3NcbiAgICAgICAgc3RhcnQgPSBmaWxlU3RhcnRzW2ldO1xuXG4gICAgICAgIHVpbnQ4W3Bvc10gPSBzdGFydCAmIDB4RkY7XG4gICAgICAgIHVpbnQ4W3BvcyArIDFdID0gc3RhcnQgPj4gOCAmIDB4RkY7XG4gICAgICAgIHVpbnQ4W3BvcyArIDJdID0gc3RhcnQgPj4gMTYgJiAweEZGO1xuICAgICAgICB1aW50OFtwb3MgKyAzXSA9IHN0YXJ0ID4+IDI0ICYgMHhGRjtcbiAgICAgICAgcG9zICs9IDQ7XG5cbiAgICAgICAgZmlsZVNpemUgPSBmaWxlLmRhdGEuYnl0ZUxlbmd0aDtcblxuICAgICAgICB1aW50OFtwb3NdID0gZmlsZVNpemUgJiAweEZGO1xuICAgICAgICB1aW50OFtwb3MgKyAxXSA9IGZpbGVTaXplID4+IDggJiAweEZGO1xuICAgICAgICB1aW50OFtwb3MgKyAyXSA9IGZpbGVTaXplID4+IDE2ICYgMHhGRjtcbiAgICAgICAgdWludDhbcG9zICsgM10gPSBmaWxlU2l6ZSA+PiAyNCAmIDB4RkY7XG4gICAgICAgIHBvcyArPSA0O1xuXG4gICAgICAgIHVpbnQ4LnNldChuZXcgVWludDhBcnJheShmaWxlLmRhdGEpLCBzdGFydCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycmF5QnVmZmVyO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGVuY29kZTsiXX0=
