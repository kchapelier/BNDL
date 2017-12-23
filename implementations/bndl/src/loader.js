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