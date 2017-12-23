!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.BndlLoader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function decode (arrayBuffer) {
    var uint8 = new Uint8Array(arrayBuffer),
        magic = (uint8[0] << 24) + (uint8[1] << 16) + (uint8[2] << 8) + uint8[3],
        version = uint8[4],
        numberOfFiles = (uint8[5] << 16) + (uint8[6] << 8) + uint8[7];

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

        start = (uint8[pos] << 24) + (uint8[pos + 1] << 16) + (uint8[pos + 2] << 8) + uint8[pos + 3];
        pos+=4;
        length = (uint8[pos] << 24) + (uint8[pos + 1] << 16) + (uint8[pos + 2] << 8) + uint8[pos + 3];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9kZWNvZGUuanMiLCJzcmMvbG9hZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBkZWNvZGUgKGFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpLFxuICAgICAgICBtYWdpYyA9ICh1aW50OFswXSA8PCAyNCkgKyAodWludDhbMV0gPDwgMTYpICsgKHVpbnQ4WzJdIDw8IDgpICsgdWludDhbM10sXG4gICAgICAgIHZlcnNpb24gPSB1aW50OFs0XSxcbiAgICAgICAgbnVtYmVyT2ZGaWxlcyA9ICh1aW50OFs1XSA8PCAxNikgKyAodWludDhbNl0gPDwgOCkgKyB1aW50OFs3XTtcblxuICAgIC8qKiBQUkVMSU1JTkFSWSBDSEVDS1MgKiovXG5cbiAgICBpZiAobWFnaWMgIT09IDB4NDI0RTQ0NEMpe1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBtYWdpYyBudW1iZXInKTtcbiAgICB9XG5cbiAgICBpZiAodmVyc2lvbiA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBmb3JtYXQgdmVyc2lvbjogJyArIHZlcnNpb24pO1xuICAgIH0gZWxzZSBpZiAodmVyc2lvbiAhPT0gMHgwMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogVW5zdXBwb3J0ZWQgZm9ybWF0IHZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgICB9XG5cbiAgICBpZiAobnVtYmVyT2ZGaWxlcyA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgZGVjb2RlcjogSW52YWxpZCBudW1iZXIgb2YgZmlsZXM6IDAnKTtcbiAgICB9XG5cbiAgICAvKiogUEFSU0lORyAqKi9cblxuICAgIHZhciBmaWxlcyA9IHt9LFxuICAgICAgICBwb3MgPSA4LFxuICAgICAgICBuYW1lLFxuICAgICAgICB0eXBlLFxuICAgICAgICBzdGFydCxcbiAgICAgICAgbGVuZ3RoLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgaTtcblxuICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJPZkZpbGVzOyBpKyspIHtcbiAgICAgICAgbmFtZSA9ICcnO1xuICAgICAgICB0eXBlID0gJyc7XG4gICAgICAgIHN0YXJ0ID0gMDtcbiAgICAgICAgbGVuZ3RoID0gMDtcblxuICAgICAgICB3aGlsZShwb3MgPCB1aW50OC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdWludDhbcG9zXTtcbiAgICAgICAgICAgIHBvcysrO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDB4MDApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmFtZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHdoaWxlKHBvcyA8IHVpbnQ4Lmxlbmd0aCkge1xuICAgICAgICAgICAgdmFsdWUgPSB1aW50OFtwb3NdO1xuICAgICAgICAgICAgcG9zKys7XG5cbiAgICAgICAgICAgIGlmICh2YWx1ZSA9PT0gMHgwMCkge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0eXBlICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgc3RhcnQgPSAodWludDhbcG9zXSA8PCAyNCkgKyAodWludDhbcG9zICsgMV0gPDwgMTYpICsgKHVpbnQ4W3BvcyArIDJdIDw8IDgpICsgdWludDhbcG9zICsgM107XG4gICAgICAgIHBvcys9NDtcbiAgICAgICAgbGVuZ3RoID0gKHVpbnQ4W3Bvc10gPDwgMjQpICsgKHVpbnQ4W3BvcyArIDFdIDw8IDE2KSArICh1aW50OFtwb3MgKyAyXSA8PCA4KSArIHVpbnQ4W3BvcyArIDNdO1xuICAgICAgICBwb3MrPTQ7XG5cbiAgICAgICAgZmlsZXNbbmFtZV0gPSB7XG4gICAgICAgICAgICB0eXBlOiB0eXBlLFxuICAgICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgICAgbGVuZ3RoOiBsZW5ndGhcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBhcnJheUJ1ZmZlcjogYXJyYXlCdWZmZXIsXG4gICAgICAgIGZpbGVzOiBmaWxlc1xuICAgIH07XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZGVjb2RlOyIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgYm5kbERlY29kZSA9IHJlcXVpcmUoJy4vZGVjb2RlJyk7XG5cbnZhciBCbmRsTG9hZGVyID0gZnVuY3Rpb24gQm5kbExvYWRlciAodHlwZXMpIHtcbiAgICB0aGlzLnR5cGVzID0gdHlwZXM7XG59O1xuXG5CbmRsTG9hZGVyLnByb3RvdHlwZS5sb2FkID0gZnVuY3Rpb24gKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCksXG4gICAgICAgIHNlbGYgPSB0aGlzO1xuXG4gICAgeGhyLnJlc3BvbnNlVHlwZSA9ICdhcnJheWJ1ZmZlcic7XG4gICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZhciBkYXRhID0gYm5kbERlY29kZSh4aHIucmVzcG9uc2UpLFxuICAgICAgICAgICAgZmlsZXNLZXlzID0gT2JqZWN0LmtleXMoZGF0YS5maWxlcyksXG4gICAgICAgICAgICBmaWxlcyA9IHt9LFxuICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgIGk7XG5cbiAgICAgICAgZm9yIChpID0gMDsgaSA8IGZpbGVzS2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHlwZSA9IGRhdGEuZmlsZXNbZmlsZXNLZXlzW2ldXS50eXBlO1xuICAgICAgICAgICAgaWYgKHNlbGYudHlwZXMuaGFzT3duUHJvcGVydHkodHlwZSkpIHtcbiAgICAgICAgICAgICAgICBmaWxlc1tmaWxlc0tleXNbaV1dID0gc2VsZi50eXBlc1t0eXBlXSh4aHIucmVzcG9uc2UsIGRhdGEuZmlsZXNbZmlsZXNLZXlzW2ldXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQk5ETCBsb2FkZXIgOiBUeXBlIHVuc3VwcG9ydGVkIDogJyArIHR5cGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2FsbGJhY2soZmlsZXMpO1xuICAgIH07XG5cbiAgICB4aHIub3BlbignZ2V0JywgdXJsLCB0cnVlKTtcbiAgICB4aHIuc2VuZCgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBCbmRsTG9hZGVyOyJdfQ==
