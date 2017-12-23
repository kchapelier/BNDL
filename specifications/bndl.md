# BNDL Specifications (version 1 / draft 2017-12-23)

## Conventions

 * The endianess of the BNDL header and dictionary is set to Little Endian.
 * The endianess of the content is not defined by the BNDL format.

The general structure of the file is the following : One *header* (8 bytes) followed by a *dictionary* (varying byte count) and the *content* block (varying byte count).

## Header

 * **Magic number / type signature** : 4 bytes
 * **Version** : Unsigned 8bit integer : 1 byte
 * **Number of files** : Unsigned 24bit integer : 3 bytes (0 to 16777215)

### Magic number / type signature

Must be set to "BNDL" (`424E444C`)

### Version

Indicates the version of the specification to apply while decoding this model.

A value of 0 should be treated as an error by the decoder.

### Number of files

The number of files contained in the bundle, stored as an unsigned 24bit integer.

A value of 0 should be treated as an error by the decoder.

## Dictionary

For each files :

 * **Identifier** : An ASCII encoded C-string (one byte per character, terminated with a NUL character)
 * **Type identifier** : An ASCII encoded C-string (one byte per character, terminated with a NUL character)
 * **Start** : Unsigned 32bit integer : 4 bytes (0 to 4294967295)
 * **Length** : Unsigned 32bit integer : 4 bytes (0 to 4294967295)

### Identifier

Identifier of the file (i.e. the original name of the file).

### Type identifier

A string defining the type of the file.

### Start

Position of the first byte of the file content in the bundle.

The start of each file content should be offset as to make its position a multiple of 4. This is done by padding the start of the content with `00` values.

### Length

Length of the file content.

## Content

Binary data of all the contained files with the eventual padding.