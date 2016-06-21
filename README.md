[![NPM version][npm-image]][npm-url]
[![NPM downloads][downloads-image]][download-url]

## Installation

```
npm install --save chrobject
// Then include in a node.js file
var chrobject = require('chrobject');
```

### Contributing

Clone the repo, then
```
npm install
node_modules/typings/dist/bin.js install
```
and here we go.
Develop your new features or fixes, test it using `npm test` and create a pull request.

## <a name="example"></a> Usage

This is a working example:
```
var chrobject = require('chrobject');
var mongoose = require('mongoose');

// Configure a storage strategy
 // The only included strategy is mongoose which needs a mongoose connection
mongoose.connect('mongodb://localhost/testChrobject');
var loggerConfig = {
    baseDir: '/Users/chotz/Desktop/logs',
    console: {
        logLevel: 'debug'
    },
    file: {
        logLevel: 'debug',
        executionFile: 'server.log',
        exceptionsFile: 'error.log'
    }
};
var mongooseStorage = new chrobject.MongooseStorage(loggerConfig);

// instanciate Chrobject
var entity = new chrobject.Entity('testObj', 'a.id');
var config = chrobject.Configuration.SNAP_AND_DIFF;
var creator = new chrobject.Creator('username', 'sourceapp');
var history = new chrobject.Chrobject(entity, config, mongooseStorage);

// save a snapshot + diff entry
history.saveEntry({ a: { id: 'adsf' }, data: { test: 'val' } }, creator, new Date(), function (err, result) {
    console.log('error:', err);
    console.log('result:', result);
    mongoose.disconnect();
    process.exit();
});
``` 

## Features

### [Entity](https://github.com/hydra-newmedia/chrobject/blob/develop/src/utils/Entity.ts)

This describes the entities to be stored.
The **name** of it is something like _car_ if you want to save the history of car objects.
The **idPath** is the path in the object by which this object is identified, eg. _exterior.plate.number_ with the car example.

### [Configuration](https://github.com/hydra-newmedia/chrobject/blob/develop/src/utils/Configuration.ts)

You can configure the Chrobject in three ways by using the Configuration enum:
* **SNAP_ONLY**: Only snapshots of the objects will be saved with a timestamp so you can get the status of the object at any time in the past.
* **DIFF_ONLY**: Only diffs of the object compared to the last status before will be saved, so you can see who changed what and when did he do so.
* **SNAP_AND_DIFF**: In this case both snapshots and diffs are stored, so you can see which changes were made at what time and what was the status of the object after that change. Each diff is therefore connected to a snapshot by a link id.

### Storage Strategy

You can implement your own storage strategy, which hast to implement interface [chrobject/src/storage/StorageStrategy.ts](https://github.com/hydra-newmedia/chrobject/blob/develop/src/storage/StorageStrategy.ts).

Currently implemented Strategies:
* [MongooseStorage](https://github.com/hydra-newmedia/chrobject/tree/develop/src/storage/mongoose): This can be used as shown in the above [example](#example). It **needs** an established mongoose connection. 

### [Creator](https://github.com/hydra-newmedia/chrobject/blob/develop/src/utils/Creator.ts)

Each time you save an entry (snap, diff or snap + diff) you can assign a creator to the change to keep track of who is changing what.
The creator consists of a **user** and a **sourceapp** to clarify through which application the user made the change. 

[npm-url]: https://npmjs.org/package/chrobject
[download-url]: https://npmjs.org/package/chrobject
[npm-image]: https://img.shields.io/npm/v/chrobject.svg?style=flat
[downloads-image]: https://img.shields.io/npm/dm/chrobject.svg?style=flat
