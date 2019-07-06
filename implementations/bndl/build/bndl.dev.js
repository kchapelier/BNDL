(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bndl = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
        version: version,
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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsImluZGV4LmpzIiwic3JjL2RlY29kZS5qcyIsInNyYy9lbmNvZGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIlwidXNlIHN0cmljdFwiO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBkZWNvZGU6IHJlcXVpcmUoJy4vc3JjL2RlY29kZScpLFxuICAgIGVuY29kZTogcmVxdWlyZSgnLi9zcmMvZW5jb2RlJylcbn07IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGRlY29kZSAoYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdWludDggPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlciksXG4gICAgICAgIG1hZ2ljID0gKHVpbnQ4WzBdIDw8IDI0KSArICh1aW50OFsxXSA8PCAxNikgKyAodWludDhbMl0gPDwgOCkgKyB1aW50OFszXSxcbiAgICAgICAgdmVyc2lvbiA9IHVpbnQ4WzRdLFxuICAgICAgICBudW1iZXJPZkZpbGVzID0gdWludDhbNV0gKyAodWludDhbNl0gPDwgOCkgICsgKHVpbnQ4WzddIDw8IDE2KTtcblxuICAgIC8qKiBQUkVMSU1JTkFSWSBDSEVDS1MgKiovXG5cbiAgICBpZiAobWFnaWMgIT09IDB4NDI0RTQ0NEMpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBtYWdpYyBudW1iZXInKTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBmb3JtYXQgdmVyc2lvbjogJyArIHZlcnNpb24pO1xuICAgIH0gZWxzZSBpZiAodmVyc2lvbiAhPT0gMHgwMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogVW5zdXBwb3J0ZWQgZm9ybWF0IHZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgICB9XG5cbiAgICBpZiAobnVtYmVyT2ZGaWxlcyA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBudW1iZXIgb2YgZmlsZXM6IDAnKTtcbiAgICB9XG5cbiAgICAvKiogUEFSU0lORyAqKi9cblxuICAgIHZhciBmaWxlcyA9IHt9LFxuICAgICAgICBwb3MgPSA4LFxuICAgICAgICBuYW1lLFxuICAgICAgICB0eXBlLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgbGVuZ3RoLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkZpbGVzOyBpKyspIHtcbiAgICAgICAgbmFtZSA9ICcnO1xuICAgICAgICB0eXBlID0gJyc7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgICAgbGVuZ3RoID0gMDtcblxuICAgICAgICB3aGlsZShwb3MgPCB1aW50OC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdWludDhbcG9zXTtcbiAgICAgICAgICAgIHBvcysrO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDB4MDApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmFtZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKHBvcyA8IHVpbnQ4Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsdWUgPSB1aW50OFtwb3NdO1xuICAgICAgICAgICAgcG9zKys7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMHgwMCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0eXBlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhcnQgPSB1aW50OFtwb3NdICsgKHVpbnQ4W3BvcyArIDFdIDw8IDgpICsgKHVpbnQ4W3BvcyArIDJdIDw8IDE2KSArICh1aW50OFtwb3MgKyAzXSA8PCAyNCk7XG4gICAgICAgIHBvcys9NDtcbiAgICAgICAgbGVuZ3RoID0gdWludDhbcG9zXSArICh1aW50OFtwb3MgKyAxXSA8PCA4KSArICh1aW50OFtwb3MgKyAyXSA8PCAxNikgKyAodWludDhbcG9zICsgM10gPDwgMjQpO1xuICAgICAgICBwb3MrPTQ7XG5cbiAgICAgICAgZmlsZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgbGVuZ3RoOiBsZW5ndGhcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICBhcnJheUJ1ZmZlcjogYXJyYXlCdWZmZXIsXG4gICAgICAgIGZpbGVzOiBmaWxlc1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVjb2RlOyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBlbmNvZGUgKGRhdGEpIHtcbiAgICB2YXIgaWRzID0gT2JqZWN0LmtleXMoZGF0YSksXG4gICAgICAgIG51bWJlck9mRmlsZXMgPSBpZHMubGVuZ3RoLFxuICAgICAgICBmaWxlU3RhcnRzID0gbmV3IEFycmF5KG51bWJlck9mRmlsZXMpLFxuICAgICAgICBzaXplID0gOCwgLy8gbWFnaWMoNCkgKyB2ZXJzaW9uKDEpICsgZmlsZSBudW1iZXIoMylcbiAgICAgICAgaTtcblxuICAgIGlmIChudW1iZXJPZkZpbGVzID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBlbmNvZGVyOiBNdXN0IGNvbnRhaW4gYXQgbGVhc3Qgb25lIGZpbGUnKTtcbiAgICB9IGVsc2UgaWYgKG51bWJlck9mRmlsZXMgPiAweEZGRkZGRikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZW5jb2RlcjogTXVzdCBjb250YWluIGxlc3MgdGhhbiAxNjc3NzIxNSBmaWxlcycpO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkZpbGVzOyBpKyspIHtcbiAgICAgICAgc2l6ZSArPSAoXG4gICAgICAgICAgICBpZHNbaV0ubGVuZ3RoICsgLy8gaWRcbiAgICAgICAgICAgIGRhdGFbaWRzW2ldXS50eXBlLmxlbmd0aCArIC8vIHR5cGVcbiAgICAgICAgICAgIDEwIC8vIGlkIG51bGwoMSkgKyB0eXBlIG51bGwgKDEpICsgc3RhcnQoNCkgKyBieXRlc2l6ZSg0KVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkZpbGVzOyBpKyspIHtcbiAgICAgICAgc2l6ZSA9IE1hdGguY2VpbChzaXplIC8gNCkgKiA0OyAvLyBwYWQgdG8gbXVsdGlwbGUgb2YgZm91clxuICAgICAgICBmaWxlU3RhcnRzW2ldID0gc2l6ZTtcbiAgICAgICAgc2l6ZSs9IGRhdGFbaWRzW2ldXS5kYXRhLmJ5dGVMZW5ndGg7XG4gICAgfVxuXG4gICAgdmFyIGFycmF5QnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKHNpemUpLFxuICAgICAgICB1aW50OCA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSxcbiAgICAgICAgcG9zID0gOCxcbiAgICAgICAgZmlsZSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGZpbGVTaXplLFxuICAgICAgICBpZCxcbiAgICAgICAgaztcblxuICAgIC8vbWFnaWMgXCJCTkRMXCJcbiAgICB1aW50OFswXSA9IDB4NDI7XG4gICAgdWludDhbMV0gPSAweDRFO1xuICAgIHVpbnQ4WzJdID0gMHg0NDtcbiAgICB1aW50OFszXSA9IDB4NEM7XG5cbiAgICAvLyB2ZXJzaW9uXG4gICAgdWludDhbNF0gPSAweDAxO1xuXG4gICAgLy8gbnVtYmVyIG9mIGZpbGVzXG4gICAgdWludDhbNV0gPSBpZHMubGVuZ3RoICYgMHhGRjtcbiAgICB1aW50OFs2XSA9IGlkcy5sZW5ndGggPj4gOCAmIDB4RkY7XG4gICAgdWludDhbN10gPSBpZHMubGVuZ3RoID4+IDE2ICYgMHhGRjtcblxuICAgIHBvcyA9IDg7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtYmVyT2ZGaWxlczsgaSsrKSB7XG4gICAgICAgIGlkID0gaWRzW2ldO1xuICAgICAgICBmaWxlID0gZGF0YVtpZF07XG5cbiAgICAgICAgZm9yIChrID0gMDsgayA8IGlkLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICB1aW50OFtwb3NdID0gKGlkLmNoYXJDb2RlQXQoaykgPD0gMHg3RiA/IGlkLmNoYXJDb2RlQXQoaykgOiAweDVGKTsgLy8gZGVmYXVsdCB0byB1bmRlcnNjb3JlXG4gICAgICAgICAgICBwb3MrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHVpbnQ4W3Bvc10gPSAweDAwO1xuICAgICAgICBwb3MrKztcblxuICAgICAgICBmb3IgKGsgPSAwOyBrIDwgZmlsZS50eXBlLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICB1aW50OFtwb3NdID0gKGZpbGUudHlwZS5jaGFyQ29kZUF0KGspIDw9IDB4N0YgPyBmaWxlLnR5cGUuY2hhckNvZGVBdChrKSA6IDB4NUYpOyAvLyBkZWZhdWx0IHRvIHVuZGVyc2NvcmVcbiAgICAgICAgICAgIHBvcysrO1xuICAgICAgICB9XG5cbiAgICAgICAgdWludDhbcG9zXSA9IDB4MDA7XG4gICAgICAgIHBvcysrO1xuXG4gICAgICAgIC8vIGluY2x1ZGUgc3RhcnQgcG9zXG4gICAgICAgIHN0YXJ0ID0gZmlsZVN0YXJ0c1tpXTtcblxuICAgICAgICB1aW50OFtwb3NdID0gc3RhcnQgJiAweEZGO1xuICAgICAgICB1aW50OFtwb3MgKyAxXSA9IHN0YXJ0ID4+IDggJiAweEZGO1xuICAgICAgICB1aW50OFtwb3MgKyAyXSA9IHN0YXJ0ID4+IDE2ICYgMHhGRjtcbiAgICAgICAgdWludDhbcG9zICsgM10gPSBzdGFydCA+PiAyNCAmIDB4RkY7XG4gICAgICAgIHBvcyArPSA0O1xuXG4gICAgICAgIGZpbGVTaXplID0gZmlsZS5kYXRhLmJ5dGVMZW5ndGg7XG5cbiAgICAgICAgdWludDhbcG9zXSA9IGZpbGVTaXplICYgMHhGRjtcbiAgICAgICAgdWludDhbcG9zICsgMV0gPSBmaWxlU2l6ZSA+PiA4ICYgMHhGRjtcbiAgICAgICAgdWludDhbcG9zICsgMl0gPSBmaWxlU2l6ZSA+PiAxNiAmIDB4RkY7XG4gICAgICAgIHVpbnQ4W3BvcyArIDNdID0gZmlsZVNpemUgPj4gMjQgJiAweEZGO1xuICAgICAgICBwb3MgKz0gNDtcblxuICAgICAgICB1aW50OC5zZXQobmV3IFVpbnQ4QXJyYXkoZmlsZS5kYXRhKSwgc3RhcnQpO1xuICAgIH1cblxuICAgIHJldHVybiBhcnJheUJ1ZmZlcjtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBlbmNvZGU7Il19
