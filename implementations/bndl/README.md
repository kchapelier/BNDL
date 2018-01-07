# BNDL

The reference encoding / decoding library for the BNDL file format.

Also contains a CLI tool (`makebndl`) to create BNDL files from the command line, as well as an example implementation of a loader for BNDL files in the browser.

BNDL is an experimental file format for bundling arbitrary files as binary bundle for consumption in JavaScript applications. More information on this [here](https://github.com/kchapelier/BNDL).

## Installing

With [npm](https://www.npmjs.com) do :

```
npm install bndl
```

To be able to use the CLI tool globally do :

```
npm install bndl -g
```

## Usage

### Encoding

```js
var bndl = require('bndl');

// this will create a bundle with a file generated from code

var arrayBuffer = bndl.encode({
    'test.bin': {
        type: 'bin',
        data: (new Uint8Array([1,2,3,4])).buffer
    }
});

console.log(arrayBuffer);
```

```js
var bndl = require('bndl'),
    fs = require('fs');

// this will create a bundle containing two files from the file system

var fileContent1 = fs.readFileSync('somefile.png'),
    fileContent2 = fs.readFileSync('someotherfile.png');

var arrayBuffer = bndl.encode({
    'somefile.png': {
        type: 'png',
        data: (new Uint8Array(fileContent1)).buffer
    },
    'someotherfile.png': {
        type: 'png',
        data: (new Uint8Array(fileContent2)).buffer
    }
});

console.log(arrayBuffer);
```

### Decoding

```js
var bndl = require('bndl');

// assume that arrayBuffer is an ArrayBuffer with the content of a valid BNDL file

var data = bndl.decode(arrayBuffer);

console.log(data); // a json containing the source arrayBuffer and a description of each files
```

### Example web loader

```js
var BndlLoader = require('bndl/src/loader');

var loader = new BndlLoader ({
    bin: function (arrayBuffer, infos) {
        // function to use to decode the files associated with the type identifier "bin"
        // infos contains the file description (type, start position in the ArrayBuffer and length)
        return new Uint8Array(arrayBuffer, infos.start, infos.length);
    }
});

loader.load('./mybundle.bndl', function (files) {
    console.log(files);
});
```

See online examples with [images](http://www.kchapelier.com/bndl/examples/images.html) and [3D models](http://www.kchapelier.com/bndl/examples/prwm-models.html).

## CLI Usage

### makebndl inputFileGlob:type ... -o outputFile [OPTIONS]

**Options**

 * **-q, --quiet :** Quiet mode. Silence the output to the console.

**Examples**

Create a bundle containing all the txt files in the directory.

```
makebndl "*.txt:txt" -o texts.bndl
```

Create a bundle containing all the png and jpg files in the directory while giving them the same type identifier.

```
makebndl "*.(png|jpg):img" -o images.bndl
```

Create a bundle from specific files.

```
makebndl model.obj:obj texture.jpg:img -o resources.bndl
```

## API

### bndl.encode(data)

 * **data :** A literal containing multiple files descriptions as literals. The keys of the `data` object are used as file identifier.
  * **type :** Type of the file, a string identifying the type of the object.
  * **data :** ArrayBuffer representing the content of the file.

### bndl.decode(bndlData)

 * **bndlData :** An ArrayBuffer with the content of a BNDL file.

Returns a literal containing the source arrayBuffer and the list of files with their associated type, start position in the arrayBuffer and content length.

```js
{
    "version": 1,
    "arrayBuffer": ArrayBuffer(312932),
    "files": {
        "images/image1.png": { "type":"img", "start":128, "length":68209 },
        "images/image2.png": { "type":"img", "start":68340, "length":76320 },
        "images/image3.png": { "type":"img", "start":144660, "length":85165 },
        "images/image4.png": { "type":"img", "start":229828, "length":83104 }
    }
}
```

## Changelog

### 1.0.0 (2018-01-07) :

 * First implementation, with full support for the first version of the format.

## License

MIT