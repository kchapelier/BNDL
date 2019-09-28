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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsInNyYy9kZWNvZGUuanMiLCJzcmMvZW5jb2RlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgZGVjb2RlOiByZXF1aXJlKCcuL3NyYy9kZWNvZGUnKSxcbiAgICBlbmNvZGU6IHJlcXVpcmUoJy4vc3JjL2VuY29kZScpXG59OyIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBkZWNvZGUgKGFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpLFxuICAgICAgICBtYWdpYyA9ICh1aW50OFswXSA8PCAyNCkgKyAodWludDhbMV0gPDwgMTYpICsgKHVpbnQ4WzJdIDw8IDgpICsgdWludDhbM10sXG4gICAgICAgIHZlcnNpb24gPSB1aW50OFs0XSxcbiAgICAgICAgbnVtYmVyT2ZGaWxlcyA9IHVpbnQ4WzVdICsgKHVpbnQ4WzZdIDw8IDgpICArICh1aW50OFs3XSA8PCAxNik7XG5cbiAgICAvKiogUFJFTElNSU5BUlkgQ0hFQ0tTICoqL1xuXG4gICAgaWYgKG1hZ2ljICE9PSAweDQyNEU0NDRDKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IEludmFsaWQgbWFnaWMgbnVtYmVyJyk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IEludmFsaWQgZm9ybWF0IHZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgICB9IGVsc2UgaWYgKHZlcnNpb24gIT09IDB4MDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IFVuc3VwcG9ydGVkIGZvcm1hdCB2ZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gICAgfVxuXG4gICAgaWYgKG51bWJlck9mRmlsZXMgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IEludmFsaWQgbnVtYmVyIG9mIGZpbGVzOiAwJyk7XG4gICAgfVxuXG4gICAgLyoqIFBBUlNJTkcgKiovXG5cbiAgICB2YXIgZmlsZXMgPSB7fSxcbiAgICAgICAgcG9zID0gOCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGxlbmd0aCxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtYmVyT2ZGaWxlczsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSAnJztcbiAgICAgICAgdHlwZSA9ICcnO1xuICAgICAgICBzdGFydCA9IDA7XG4gICAgICAgIGxlbmd0aCA9IDA7XG5cbiAgICAgICAgd2hpbGUocG9zIDwgdWludDgubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVpbnQ4W3Bvc107XG4gICAgICAgICAgICBwb3MrKztcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAweDAwKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZShwb3MgPCB1aW50OC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdWludDhbcG9zXTtcbiAgICAgICAgICAgIHBvcysrO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDB4MDApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHlwZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXJ0ID0gdWludDhbcG9zXSArICh1aW50OFtwb3MgKyAxXSA8PCA4KSArICh1aW50OFtwb3MgKyAyXSA8PCAxNikgKyAodWludDhbcG9zICsgM10gPDwgMjQpO1xuICAgICAgICBwb3MrPTQ7XG4gICAgICAgIGxlbmd0aCA9IHVpbnQ4W3Bvc10gKyAodWludDhbcG9zICsgMV0gPDwgOCkgKyAodWludDhbcG9zICsgMl0gPDwgMTYpICsgKHVpbnQ4W3BvcyArIDNdIDw8IDI0KTtcbiAgICAgICAgcG9zKz00O1xuXG4gICAgICAgIGZpbGVzW25hbWVdID0ge1xuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGxlbmd0aDogbGVuZ3RoXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdmVyc2lvbjogdmVyc2lvbixcbiAgICAgICAgYXJyYXlCdWZmZXI6IGFycmF5QnVmZmVyLFxuICAgICAgICBmaWxlczogZmlsZXNcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlY29kZTsiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gZW5jb2RlIChkYXRhKSB7XG4gICAgdmFyIGlkcyA9IE9iamVjdC5rZXlzKGRhdGEpLFxuICAgICAgICBudW1iZXJPZkZpbGVzID0gaWRzLmxlbmd0aCxcbiAgICAgICAgZmlsZVN0YXJ0cyA9IG5ldyBBcnJheShudW1iZXJPZkZpbGVzKSxcbiAgICAgICAgc2l6ZSA9IDgsIC8vIG1hZ2ljKDQpICsgdmVyc2lvbigxKSArIGZpbGUgbnVtYmVyKDMpXG4gICAgICAgIGk7XG5cbiAgICBpZiAobnVtYmVyT2ZGaWxlcyA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZW5jb2RlcjogTXVzdCBjb250YWluIGF0IGxlYXN0IG9uZSBmaWxlJyk7XG4gICAgfSBlbHNlIGlmIChudW1iZXJPZkZpbGVzID4gMHhGRkZGRkYpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGVuY29kZXI6IE11c3QgY29udGFpbiBsZXNzIHRoYW4gMTY3NzcyMTUgZmlsZXMnKTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtYmVyT2ZGaWxlczsgaSsrKSB7XG4gICAgICAgIHNpemUgKz0gKFxuICAgICAgICAgICAgaWRzW2ldLmxlbmd0aCArIC8vIGlkXG4gICAgICAgICAgICBkYXRhW2lkc1tpXV0udHlwZS5sZW5ndGggKyAvLyB0eXBlXG4gICAgICAgICAgICAxMCAvLyBpZCBudWxsKDEpICsgdHlwZSBudWxsICgxKSArIHN0YXJ0KDQpICsgYnl0ZXNpemUoNClcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtYmVyT2ZGaWxlczsgaSsrKSB7XG4gICAgICAgIHNpemUgPSBNYXRoLmNlaWwoc2l6ZSAvIDQpICogNDsgLy8gcGFkIHRvIG11bHRpcGxlIG9mIGZvdXJcbiAgICAgICAgZmlsZVN0YXJ0c1tpXSA9IHNpemU7XG4gICAgICAgIHNpemUrPSBkYXRhW2lkc1tpXV0uZGF0YS5ieXRlTGVuZ3RoO1xuICAgIH1cblxuICAgIHZhciBhcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcihzaXplKSxcbiAgICAgICAgdWludDggPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlciksXG4gICAgICAgIHBvcyA9IDgsXG4gICAgICAgIGZpbGUsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBmaWxlU2l6ZSxcbiAgICAgICAgaWQsXG4gICAgICAgIGs7XG5cbiAgICAvL21hZ2ljIFwiQk5ETFwiXG4gICAgdWludDhbMF0gPSAweDQyO1xuICAgIHVpbnQ4WzFdID0gMHg0RTtcbiAgICB1aW50OFsyXSA9IDB4NDQ7XG4gICAgdWludDhbM10gPSAweDRDO1xuXG4gICAgLy8gdmVyc2lvblxuICAgIHVpbnQ4WzRdID0gMHgwMTtcblxuICAgIC8vIG51bWJlciBvZiBmaWxlc1xuICAgIHVpbnQ4WzVdID0gaWRzLmxlbmd0aCAmIDB4RkY7XG4gICAgdWludDhbNl0gPSBpZHMubGVuZ3RoID4+IDggJiAweEZGO1xuICAgIHVpbnQ4WzddID0gaWRzLmxlbmd0aCA+PiAxNiAmIDB4RkY7XG5cbiAgICBwb3MgPSA4O1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG51bWJlck9mRmlsZXM7IGkrKykge1xuICAgICAgICBpZCA9IGlkc1tpXTtcbiAgICAgICAgZmlsZSA9IGRhdGFbaWRdO1xuXG4gICAgICAgIGZvciAoayA9IDA7IGsgPCBpZC5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgdWludDhbcG9zXSA9IChpZC5jaGFyQ29kZUF0KGspIDw9IDB4N0YgPyBpZC5jaGFyQ29kZUF0KGspIDogMHg1Rik7IC8vIGRlZmF1bHQgdG8gdW5kZXJzY29yZVxuICAgICAgICAgICAgcG9zKys7XG4gICAgICAgIH1cblxuICAgICAgICB1aW50OFtwb3NdID0gMHgwMDtcbiAgICAgICAgcG9zKys7XG5cbiAgICAgICAgZm9yIChrID0gMDsgayA8IGZpbGUudHlwZS5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgdWludDhbcG9zXSA9IChmaWxlLnR5cGUuY2hhckNvZGVBdChrKSA8PSAweDdGID8gZmlsZS50eXBlLmNoYXJDb2RlQXQoaykgOiAweDVGKTsgLy8gZGVmYXVsdCB0byB1bmRlcnNjb3JlXG4gICAgICAgICAgICBwb3MrKztcbiAgICAgICAgfVxuXG4gICAgICAgIHVpbnQ4W3Bvc10gPSAweDAwO1xuICAgICAgICBwb3MrKztcblxuICAgICAgICAvLyBpbmNsdWRlIHN0YXJ0IHBvc1xuICAgICAgICBzdGFydCA9IGZpbGVTdGFydHNbaV07XG5cbiAgICAgICAgdWludDhbcG9zXSA9IHN0YXJ0ICYgMHhGRjtcbiAgICAgICAgdWludDhbcG9zICsgMV0gPSBzdGFydCA+PiA4ICYgMHhGRjtcbiAgICAgICAgdWludDhbcG9zICsgMl0gPSBzdGFydCA+PiAxNiAmIDB4RkY7XG4gICAgICAgIHVpbnQ4W3BvcyArIDNdID0gc3RhcnQgPj4gMjQgJiAweEZGO1xuICAgICAgICBwb3MgKz0gNDtcblxuICAgICAgICBmaWxlU2l6ZSA9IGZpbGUuZGF0YS5ieXRlTGVuZ3RoO1xuXG4gICAgICAgIHVpbnQ4W3Bvc10gPSBmaWxlU2l6ZSAmIDB4RkY7XG4gICAgICAgIHVpbnQ4W3BvcyArIDFdID0gZmlsZVNpemUgPj4gOCAmIDB4RkY7XG4gICAgICAgIHVpbnQ4W3BvcyArIDJdID0gZmlsZVNpemUgPj4gMTYgJiAweEZGO1xuICAgICAgICB1aW50OFtwb3MgKyAzXSA9IGZpbGVTaXplID4+IDI0ICYgMHhGRjtcbiAgICAgICAgcG9zICs9IDQ7XG5cbiAgICAgICAgdWludDguc2V0KG5ldyBVaW50OEFycmF5KGZpbGUuZGF0YSksIHN0YXJ0KTtcbiAgICB9XG5cbiAgICByZXR1cm4gYXJyYXlCdWZmZXI7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZW5jb2RlOyJdfQ==
