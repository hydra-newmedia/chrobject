[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][download-url]

## Installation

```
npm install --save chrobject
// Then include in a node.js file
var Repository = require('mongoose-repo').Repository;
``` 

### Contributing

Clone the repo, then
```
npm install
node_modules/typings/dist/bin.js install
// ATTENTION: the typings for mongoose is not up to date. Until it is you have to `cp ./mongoose.d.ts ./typings/modules/mongoose/index.d.ts` for typing convenience 
```
and here we go.
Develop your new features or fixes, test it using `npm test` and create a pull request.

## Features

##### Configuration

[npm-url]: https://npmjs.org/package/chrobject
[download-url]: https://npmjs.org/package/chrobject
[npm-image]: https://img.shields.io/npm/v/chrobject.svg?style=flat
[downloads-image]: https://img.shields.io/npm/dm/chrobject.svg?style=flat
