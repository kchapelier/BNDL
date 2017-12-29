!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.BndlLoader=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsInNyYy9kZWNvZGUuanMiLCJzcmMvbG9hZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBkZWNvZGUgKGFycmF5QnVmZmVyKSB7XG4gICAgdmFyIHVpbnQ4ID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlCdWZmZXIpLFxuICAgICAgICBtYWdpYyA9ICh1aW50OFswXSA8PCAyNCkgKyAodWludDhbMV0gPDwgMTYpICsgKHVpbnQ4WzJdIDw8IDgpICsgdWludDhbM10sXG4gICAgICAgIHZlcnNpb24gPSB1aW50OFs0XSxcbiAgICAgICAgbnVtYmVyT2ZGaWxlcyA9IHVpbnQ4WzVdICsgKHVpbnQ4WzZdIDw8IDgpICArICh1aW50OFs3XSA8PCAxNik7XG5cbiAgICAvKiogUFJFTElNSU5BUlkgQ0hFQ0tTICoqL1xuXG4gICAgaWYgKG1hZ2ljICE9PSAweDQyNEU0NDRDKXtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IEludmFsaWQgbWFnaWMgbnVtYmVyJyk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnNpb24gPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IEludmFsaWQgZm9ybWF0IHZlcnNpb246ICcgKyB2ZXJzaW9uKTtcbiAgICB9IGVsc2UgaWYgKHZlcnNpb24gIT09IDB4MDEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IFVuc3VwcG9ydGVkIGZvcm1hdCB2ZXJzaW9uOiAnICsgdmVyc2lvbik7XG4gICAgfVxuXG4gICAgaWYgKG51bWJlck9mRmlsZXMgPT09IDApIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdCTkRMIGRlY29kZXI6IEludmFsaWQgbnVtYmVyIG9mIGZpbGVzOiAwJyk7XG4gICAgfVxuXG4gICAgLyoqIFBBUlNJTkcgKiovXG5cbiAgICB2YXIgZmlsZXMgPSB7fSxcbiAgICAgICAgcG9zID0gOCxcbiAgICAgICAgbmFtZSxcbiAgICAgICAgdHlwZSxcbiAgICAgICAgc3RhcnQsXG4gICAgICAgIGxlbmd0aCxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIGk7XG5cbiAgICBmb3IgKGkgPSAwOyBpIDwgbnVtYmVyT2ZGaWxlczsgaSsrKSB7XG4gICAgICAgIG5hbWUgPSAnJztcbiAgICAgICAgdHlwZSA9ICcnO1xuICAgICAgICBzdGFydCA9IDA7XG4gICAgICAgIGxlbmd0aCA9IDA7XG5cbiAgICAgICAgd2hpbGUocG9zIDwgdWludDgubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YWx1ZSA9IHVpbnQ4W3Bvc107XG4gICAgICAgICAgICBwb3MrKztcblxuICAgICAgICAgICAgaWYgKHZhbHVlID09PSAweDAwKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5hbWUgKz0gU3RyaW5nLmZyb21DaGFyQ29kZSh2YWx1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZShwb3MgPCB1aW50OC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdWludDhbcG9zXTtcbiAgICAgICAgICAgIHBvcysrO1xuXG4gICAgICAgICAgICBpZiAodmFsdWUgPT09IDB4MDApIHtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdHlwZSArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXJ0ID0gdWludDhbcG9zXSArICh1aW50OFtwb3MgKyAxXSA8PCA4KSArICh1aW50OFtwb3MgKyAyXSA8PCAxNikgKyAodWludDhbcG9zICsgM10gPDwgMjQpO1xuICAgICAgICBwb3MrPTQ7XG4gICAgICAgIGxlbmd0aCA9IHVpbnQ4W3Bvc10gKyAodWludDhbcG9zICsgMV0gPDwgOCkgKyAodWludDhbcG9zICsgMl0gPDwgMTYpICsgKHVpbnQ4W3BvcyArIDNdIDw8IDI0KTtcbiAgICAgICAgcG9zKz00O1xuXG4gICAgICAgIGZpbGVzW25hbWVdID0ge1xuICAgICAgICAgICAgdHlwZTogdHlwZSxcbiAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgIGxlbmd0aDogbGVuZ3RoXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgYXJyYXlCdWZmZXI6IGFycmF5QnVmZmVyLFxuICAgICAgICBmaWxlczogZmlsZXNcbiAgICB9O1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGRlY29kZTsiLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGJuZGxEZWNvZGUgPSByZXF1aXJlKCcuL2RlY29kZScpO1xuXG52YXIgQm5kbExvYWRlciA9IGZ1bmN0aW9uIEJuZGxMb2FkZXIgKHR5cGVzKSB7XG4gICAgdGhpcy50eXBlcyA9IHR5cGVzO1xufTtcblxuQm5kbExvYWRlci5wcm90b3R5cGUubG9hZCA9IGZ1bmN0aW9uICh1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpLFxuICAgICAgICBzZWxmID0gdGhpcztcblxuICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgZGF0YSA9IGJuZGxEZWNvZGUoeGhyLnJlc3BvbnNlKSxcbiAgICAgICAgICAgIGZpbGVzS2V5cyA9IE9iamVjdC5rZXlzKGRhdGEuZmlsZXMpLFxuICAgICAgICAgICAgZmlsZXMgPSB7fSxcbiAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICBpO1xuXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBmaWxlc0tleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHR5cGUgPSBkYXRhLmZpbGVzW2ZpbGVzS2V5c1tpXV0udHlwZTtcbiAgICAgICAgICAgIGlmIChzZWxmLnR5cGVzLmhhc093blByb3BlcnR5KHR5cGUpKSB7XG4gICAgICAgICAgICAgICAgZmlsZXNbZmlsZXNLZXlzW2ldXSA9IHNlbGYudHlwZXNbdHlwZV0oeGhyLnJlc3BvbnNlLCBkYXRhLmZpbGVzW2ZpbGVzS2V5c1tpXV0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0JOREwgbG9hZGVyIDogVHlwZSB1bnN1cHBvcnRlZCA6ICcgKyB0eXBlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNhbGxiYWNrKGZpbGVzKTtcbiAgICB9O1xuXG4gICAgeGhyLm9wZW4oJ2dldCcsIHVybCwgdHJ1ZSk7XG4gICAgeGhyLnNlbmQoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gQm5kbExvYWRlcjsiXX0=
