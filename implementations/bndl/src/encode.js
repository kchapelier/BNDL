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