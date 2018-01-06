"use strict";

var lib = require('../index'),
    fs = require('fs'),
    should = require('chai').should();

var bndlBuffer = fs.readFileSync(__dirname + '/assets/test.bin');

var validBndl = new Uint8Array(bndlBuffer).buffer;

var bndlInvalidMagicArray = new Uint8Array(bndlBuffer),
    bndlVersion0Array = new Uint8Array(bndlBuffer),
    bndlVersion2Array = new Uint8Array(bndlBuffer),
    bndlNoFileArray = new Uint8Array(bndlBuffer),
    bndlInvalidMagic = bndlInvalidMagicArray.buffer,
    bndlVersion0 = bndlVersion0Array.buffer,
    bndlVersion2 = bndlVersion2Array.buffer,
    bndlNoFile = bndlNoFileArray.buffer;

bndlInvalidMagicArray[3] = bndlInvalidMagicArray[3] + 1;
bndlVersion0Array[4] = 0;
bndlVersion2Array[4] = 2;
bndlNoFileArray[5] = bndlNoFileArray[6] = bndlNoFileArray[7] = 0;

describe('decode()', function () {
    it('should properly read a correctly formatted file', function () {
        var data = lib.decode(validBndl);

        data.version.should.be.a('Number');
        data.version.should.be.equal(1);
        data.arrayBuffer.should.be.an('ArrayBuffer');
        data.arrayBuffer.byteLength.should.be.equal(42);
        data.files.should.be.deep.equal({
            'notes.txt': {
                type: 'txt',
                start: 32,
                length: 10
            }
        });
    });

    it('should throw an error if the magic number is not correct', function () {
        (function () { lib.decode(bndlInvalidMagic); }).should.throw('BNDL decoder: Invalid magic number');
    });

    it('should throw an error if the version is 0', function () {
        (function () { lib.decode(bndlVersion0); }).should.throw('BNDL decoder: Invalid format version: 0');
    });

    it('should throw an error if the version is not the same as the lib', function () {
        (function () { lib.decode(bndlVersion2); }).should.throw('BNDL decoder: Unsupported format version: 2');
    });

    it('should throw an error if the number of files is zero', function () {
        (function () { lib.decode(bndlNoFile); }).should.throw('BNDL decoder: Invalid number of files: 0');
    });
});


