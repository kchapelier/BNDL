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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvZGVjb2RlLmpzIiwic3JjL2xvYWRlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKXtmdW5jdGlvbiByKGUsbix0KXtmdW5jdGlvbiBvKGksZil7aWYoIW5baV0pe2lmKCFlW2ldKXt2YXIgYz1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlO2lmKCFmJiZjKXJldHVybiBjKGksITApO2lmKHUpcmV0dXJuIHUoaSwhMCk7dmFyIGE9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitpK1wiJ1wiKTt0aHJvdyBhLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsYX12YXIgcD1uW2ldPXtleHBvcnRzOnt9fTtlW2ldWzBdLmNhbGwocC5leHBvcnRzLGZ1bmN0aW9uKHIpe3ZhciBuPWVbaV1bMV1bcl07cmV0dXJuIG8obnx8cil9LHAscC5leHBvcnRzLHIsZSxuLHQpfXJldHVybiBuW2ldLmV4cG9ydHN9Zm9yKHZhciB1PVwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmUmJnJlcXVpcmUsaT0wO2k8dC5sZW5ndGg7aSsrKW8odFtpXSk7cmV0dXJuIG99cmV0dXJuIHJ9KSgpIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIGRlY29kZSAoYXJyYXlCdWZmZXIpIHtcbiAgICB2YXIgdWludDggPSBuZXcgVWludDhBcnJheShhcnJheUJ1ZmZlciksXG4gICAgICAgIG1hZ2ljID0gKHVpbnQ4WzBdIDw8IDI0KSArICh1aW50OFsxXSA8PCAxNikgKyAodWludDhbMl0gPDwgOCkgKyB1aW50OFszXSxcbiAgICAgICAgdmVyc2lvbiA9IHVpbnQ4WzRdLFxuICAgICAgICBudW1iZXJPZkZpbGVzID0gdWludDhbNV0gKyAodWludDhbNl0gPDwgOCkgICsgKHVpbnQ4WzddIDw8IDE2KTtcblxuICAgIC8qKiBQUkVMSU1JTkFSWSBDSEVDS1MgKiovXG5cbiAgICBpZiAobWFnaWMgIT09IDB4NDI0RTQ0NEMpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBtYWdpYyBudW1iZXInKTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBmb3JtYXQgdmVyc2lvbjogJyArIHZlcnNpb24pO1xuICAgIH0gZWxzZSBpZiAodmVyc2lvbiAhPT0gMHgwMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogVW5zdXBwb3J0ZWQgZm9ybWF0IHZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgICB9XG5cbiAgICBpZiAobnVtYmVyT2ZGaWxlcyA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBudW1iZXIgb2YgZmlsZXM6IDAnKTtcbiAgICB9XG5cbiAgICAvKiogUEFSU0lORyAqKi9cblxuICAgIHZhciBmaWxlcyA9IHt9LFxuICAgICAgICBwb3MgPSA4LFxuICAgICAgICBuYW1lLFxuICAgICAgICB0eXBlLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgbGVuZ3RoLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkZpbGVzOyBpKyspIHtcbiAgICAgICAgbmFtZSA9ICcnO1xuICAgICAgICB0eXBlID0gJyc7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgICAgbGVuZ3RoID0gMDtcblxuICAgICAgICB3aGlsZShwb3MgPCB1aW50OC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdWludDhbcG9zXTtcbiAgICAgICAgICAgIHBvcysrO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDB4MDApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmFtZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKHBvcyA8IHVpbnQ4Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsdWUgPSB1aW50OFtwb3NdO1xuICAgICAgICAgICAgcG9zKys7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMHgwMCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0eXBlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhcnQgPSB1aW50OFtwb3NdICsgKHVpbnQ4W3BvcyArIDFdIDw8IDgpICsgKHVpbnQ4W3BvcyArIDJdIDw8IDE2KSArICh1aW50OFtwb3MgKyAzXSA8PCAyNCk7XG4gICAgICAgIHBvcys9NDtcbiAgICAgICAgbGVuZ3RoID0gdWludDhbcG9zXSArICh1aW50OFtwb3MgKyAxXSA8PCA4KSArICh1aW50OFtwb3MgKyAyXSA8PCAxNikgKyAodWludDhbcG9zICsgM10gPDwgMjQpO1xuICAgICAgICBwb3MrPTQ7XG5cbiAgICAgICAgZmlsZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgbGVuZ3RoOiBsZW5ndGhcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICB2ZXJzaW9uOiB2ZXJzaW9uLFxuICAgICAgICBhcnJheUJ1ZmZlcjogYXJyYXlCdWZmZXIsXG4gICAgICAgIGZpbGVzOiBmaWxlc1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVjb2RlOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgYm5kbERlY29kZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5cbnZhciBCbmRsTG9hZGVyID0gZnVuY3Rpb24gQm5kbExvYWRlciAodHlwZXMpIHtcbiAgICB0aGlzLnR5cGVzID0gdHlwZXM7XG59O1xuXG5CbmRsTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBkYXRhID0gYm5kbERlY29kZSh4aHIucmVzcG9uc2UpLFxuICAgICAgICAgICAgZmlsZXNLZXlzID0gT2JqZWN0LmtleXMoZGF0YS5maWxlcyksXG4gICAgICAgICAgICBmaWxlcyA9IHt9LFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHlwZSA9IGRhdGEuZmlsZXNbZmlsZXNLZXlzW2ldXS50eXBlO1xuICAgICAgICAgICAgaWYgKHNlbGYudHlwZXMuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICAgICAgICAgICAgICBmaWxlc1tmaWxlc0tleXNbaV1dID0gc2VsZi50eXBlc1t0eXBlXSh4aHIucmVzcG9uc2UsIGRhdGEuZmlsZXNbZmlsZXNLZXlzW2ldXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBsb2FkZXIgOiBUeXBlIHVuc3VwcG9ydGVkIDogJyArIHR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2soZmlsZXMpO1xuICAgIH07XG5cbiAgICB4aHIub3BlbignZ2V0JywgdXJsLCB0cnVlKTtcbiAgICB4aHIuc2VuZCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbmRsTG9hZGVyOyJdfQ==
