"use strict";

var lib = require('../index'),
    should = require('chai').should();

describe('Full round (encode -> decode -> compare)', function () {
    it('should be able to decode encoded data', function () {
        var arrayBuffer = lib.encode({
            'my_file1.bin': {
                type: 'bin',
                data: (new Uint8Array([1,2,3,4])).buffer
            },
            'my_file2.data': {
                type: 'data',
                data: (new Uint8Array([1,2,3,4,5])).buffer
            },
            'my_file3.data': {
                type: 'data',
                data: (new Uint8Array([1,2,3,4,5,6])).buffer
            }
        });

        var decodedData = lib.decode(arrayBuffer);
        decodedData.version.should.be.a('Number');
        decodedData.version.should.be.equal(1);
        decodedData.arrayBuffer.should.be.an('ArrayBuffer');
        decodedData.files.should.be.an('object');
        Object.keys(decodedData.files).should.have.a.lengthOf(3);
        decodedData.files.should.contains.all.keys('my_file1.bin', 'my_file2.data', 'my_file3.data');

        decodedData.files['my_file1.bin'].type.should.equal('bin');
        decodedData.files['my_file1.bin'].length.should.equal(4);
        decodedData.files['my_file2.data'].type.should.equal('data');
        decodedData.files['my_file2.data'].length.should.equal(5);
        decodedData.files['my_file3.data'].type.should.equal('data');
        decodedData.files['my_file3.data'].length.should.equal(6);

        (new Uint8Array(
            decodedData.arrayBuffer,
            decodedData.files['my_file1.bin'].start,
            decodedData.files['my_file1.bin'].length
        )).should.deep.equal(new Uint8Array([1,2,3,4]));

        (new Uint8Array(
            decodedData.arrayBuffer,
            decodedData.files['my_file2.data'].start,
            decodedData.files['my_file2.data'].length
        )).should.deep.equal(new Uint8Array([1,2,3,4,5]));

        (new Uint8Array(
            decodedData.arrayBuffer,
            decodedData.files['my_file3.data'].start,
            decodedData.files['my_file3.data'].length
        )).should.deep.equal(new Uint8Array([1,2,3,4,5,6]));
    });
});