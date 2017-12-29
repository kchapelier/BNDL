"use strict";

var lib = require('../index'),
    should = require('chai').should();

describe('encode()', function () {
    it('should return an arraybuffer', function () {
        lib.encode({
            test: {
                type: 'bin',
                data: (new Uint8Array([1,2,3,4])).buffer
            }
        }).should.be.an('ArrayBuffer');
    });

    it('should specify it is the version 1 of the format', function () {
        var arrayBuffer = lib.encode({
            test: {
                type: 'bin',
                data: (new Uint8Array([1,2,3,4])).buffer
            }
        });

        (new Uint8Array(arrayBuffer))[4].should.equal(1);
    });

    it('should correctly set the number of files', function () {
        var uint8 = new Uint8Array(lib.encode({
            test: {
                type: 'bin',
                data: (new Uint8Array([1,2,3,4])).buffer
            }
        }));

        // 0x000001
        uint8[5].should.equal(1);
        uint8[6].should.equal(0);
        uint8[7].should.equal(0);

        var data = {};

        for (var i = 0; i < 511; i++) {
            data['file' + i] = {
                type: 'bin',
                data: (new Uint8Array([1,2,3,4])).buffer
            }
        }

        uint8 = new Uint8Array(lib.encode(data));

        // 0x0001FF
        uint8[5].should.equal(255);
        uint8[6].should.equal(1);
        uint8[7].should.equal(0);
    });

    it('should throw an error if the number of files is zero', function () {
        (function () { lib.encode({}); }).should.throw('BNDL encoder: Must contain at least one file');
    });

    /*
    it('should throw an error if the number of files is greater than 16777215', function () {
        var data = {};

        var dataBuffer = {
            type: 'bin',
            buffer: (new ArrayBuffer(0))
        };

        for (var i = 0; i < 0xFFFFFF + 1; i++) {
            data['file'+i] = dataBuffer;
        }

        (function () { lib.encode(data); }).should.throw('BNDL encoder: Must contain less than 16777215 files');
    });
    */
});