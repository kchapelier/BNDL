(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.BndlLoader = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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
},{}],2:[function(require,module,exports){
"use strict";

var bndlDecode = require('./decode');

var BndlLoader = function BndlLoader (types) {
    this.types = types;
};

BndlLoader.prototype.load = function (url, callback) {
    var xhr = new XMLHttpRequest(),
        self = this;

    xhr.responseType = 'arraybuffer';
    xhr.onload = function (e) {
        var data = bndlDecode(xhr.response),
            filesKeys = Object.keys(data.files),
            files = {},
            type,
            i;

        for (i = 0; i < filesKeys.length; i++) {
            type = data.files[filesKeys[i]].type;
            if (self.types.hasOwnProperty(type)) {
                files[filesKeys[i]] = self.types[type](xhr.response, data.files[filesKeys[i]]);
            } else {
                throw new Error('BNDL loader : Type unsupported : ' + type);
            }
        }

        callback(files);
    };

    xhr.open('get', url, true);
    xhr.send();
};

module.exports = BndlLoader;
},{"./decode":1}]},{},[2])(2)
});

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9kZWNvZGUuanMiLCJzcmMvbG9hZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbigpe2Z1bmN0aW9uIHIoZSxuLHQpe2Z1bmN0aW9uIG8oaSxmKXtpZighbltpXSl7aWYoIWVbaV0pe3ZhciBjPVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmU7aWYoIWYmJmMpcmV0dXJuIGMoaSwhMCk7aWYodSlyZXR1cm4gdShpLCEwKTt2YXIgYT1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK2krXCInXCIpO3Rocm93IGEuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixhfXZhciBwPW5baV09e2V4cG9ydHM6e319O2VbaV1bMF0uY2FsbChwLmV4cG9ydHMsZnVuY3Rpb24ocil7dmFyIG49ZVtpXVsxXVtyXTtyZXR1cm4gbyhufHxyKX0scCxwLmV4cG9ydHMscixlLG4sdCl9cmV0dXJuIG5baV0uZXhwb3J0c31mb3IodmFyIHU9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZSxpPTA7aTx0Lmxlbmd0aDtpKyspbyh0W2ldKTtyZXR1cm4gb31yZXR1cm4gcn0pKCkiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gZGVjb2RlIChhcnJheUJ1ZmZlcikge1xuICAgIHZhciB1aW50OCA9IG5ldyBVaW50OEFycmF5KGFycmF5QnVmZmVyKSxcbiAgICAgICAgbWFnaWMgPSAodWludDhbMF0gPDwgMjQpICsgKHVpbnQ4WzFdIDw8IDE2KSArICh1aW50OFsyXSA8PCA4KSArIHVpbnQ4WzNdLFxuICAgICAgICB2ZXJzaW9uID0gdWludDhbNF0sXG4gICAgICAgIG51bWJlck9mRmlsZXMgPSB1aW50OFs1XSArICh1aW50OFs2XSA8PCA4KSAgKyAodWludDhbN10gPDwgMTYpO1xuXG4gICAgLyoqIFBSRUxJTUlOQVJZIENIRUNLUyAqKi9cblxuICAgIGlmIChtYWdpYyAhPT0gMHg0MjRFNDQ0Qyl7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBJbnZhbGlkIG1hZ2ljIG51bWJlcicpO1xuICAgIH1cblxuICAgIGlmICh2ZXJzaW9uID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBJbnZhbGlkIGZvcm1hdCB2ZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gICAgfSBlbHNlIGlmICh2ZXJzaW9uICE9PSAweDAxKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBVbnN1cHBvcnRlZCBmb3JtYXQgdmVyc2lvbjogJyArIHZlcnNpb24pO1xuICAgIH1cblxuICAgIGlmIChudW1iZXJPZkZpbGVzID09PSAwKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBkZWNvZGVyOiBJbnZhbGlkIG51bWJlciBvZiBmaWxlczogMCcpO1xuICAgIH1cblxuICAgIC8qKiBQQVJTSU5HICoqL1xuXG4gICAgdmFyIGZpbGVzID0ge30sXG4gICAgICAgIHBvcyA9IDgsXG4gICAgICAgIG5hbWUsXG4gICAgICAgIHR5cGUsXG4gICAgICAgIHN0YXJ0LFxuICAgICAgICBsZW5ndGgsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICBpO1xuXG4gICAgZm9yIChpID0gMDsgaSA8IG51bWJlck9mRmlsZXM7IGkrKykge1xuICAgICAgICBuYW1lID0gJyc7XG4gICAgICAgIHR5cGUgPSAnJztcbiAgICAgICAgc3RhcnQgPSAwO1xuICAgICAgICBsZW5ndGggPSAwO1xuXG4gICAgICAgIHdoaWxlKHBvcyA8IHVpbnQ4Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsdWUgPSB1aW50OFtwb3NdO1xuICAgICAgICAgICAgcG9zKys7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMHgwMCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuYW1lICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUocG9zIDwgdWludDgubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVpbnQ4W3Bvc107XG4gICAgICAgICAgICBwb3MrKztcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAweDAwKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHR5cGUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBzdGFydCA9IHVpbnQ4W3Bvc10gKyAodWludDhbcG9zICsgMV0gPDwgOCkgKyAodWludDhbcG9zICsgMl0gPDwgMTYpICsgKHVpbnQ4W3BvcyArIDNdIDw8IDI0KTtcbiAgICAgICAgcG9zKz00O1xuICAgICAgICBsZW5ndGggPSB1aW50OFtwb3NdICsgKHVpbnQ4W3BvcyArIDFdIDw8IDgpICsgKHVpbnQ4W3BvcyArIDJdIDw8IDE2KSArICh1aW50OFtwb3MgKyAzXSA8PCAyNCk7XG4gICAgICAgIHBvcys9NDtcblxuICAgICAgICBmaWxlc1tuYW1lXSA9IHtcbiAgICAgICAgICAgIHR5cGU6IHR5cGUsXG4gICAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgICBsZW5ndGg6IGxlbmd0aFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHZlcnNpb246IHZlcnNpb24sXG4gICAgICAgIGFycmF5QnVmZmVyOiBhcnJheUJ1ZmZlcixcbiAgICAgICAgZmlsZXM6IGZpbGVzXG4gICAgfTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBkZWNvZGU7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBibmRsRGVjb2RlID0gcmVxdWlyZSgnLi9kZWNvZGUnKTtcblxudmFyIEJuZGxMb2FkZXIgPSBmdW5jdGlvbiBCbmRsTG9hZGVyICh0eXBlcykge1xuICAgIHRoaXMudHlwZXMgPSB0eXBlcztcbn07XG5cbkJuZGxMb2FkZXIucHJvdG90eXBlLmxvYWQgPSBmdW5jdGlvbiAodXJsLCBjYWxsYmFjaykge1xuICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcbiAgICAgICAgc2VsZiA9IHRoaXM7XG5cbiAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICB4aHIub25sb2FkID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBibmRsRGVjb2RlKHhoci5yZXNwb25zZSksXG4gICAgICAgICAgICBmaWxlc0tleXMgPSBPYmplY3Qua2V5cyhkYXRhLmZpbGVzKSxcbiAgICAgICAgICAgIGZpbGVzID0ge30sXG4gICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgaTtcblxuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgZmlsZXNLZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0eXBlID0gZGF0YS5maWxlc1tmaWxlc0tleXNbaV1dLnR5cGU7XG4gICAgICAgICAgICBpZiAoc2VsZi50eXBlcy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkge1xuICAgICAgICAgICAgICAgIGZpbGVzW2ZpbGVzS2V5c1tpXV0gPSBzZWxmLnR5cGVzW3R5cGVdKHhoci5yZXNwb25zZSwgZGF0YS5maWxlc1tmaWxlc0tleXNbaV1dKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGxvYWRlciA6IFR5cGUgdW5zdXBwb3J0ZWQgOiAnICsgdHlwZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjYWxsYmFjayhmaWxlcyk7XG4gICAgfTtcblxuICAgIHhoci5vcGVuKCdnZXQnLCB1cmwsIHRydWUpO1xuICAgIHhoci5zZW5kKCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJuZGxMb2FkZXI7Il19
