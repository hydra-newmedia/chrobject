/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 17.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import * as sinon from 'sinon';
import * as hash from 'object-hash';
import { Repository } from 'mongoose-repo';
import { Types } from 'mongoose';
import { LoggerConfig } from 'be-utils';
import { MongooseStorage } from '../../../../lib/storage/mongoose/MongooseStorage';
import {
    SnapshotModel,
    SnapshotDocument
} from '../../../../lib/storage/mongoose/models/SnapshotModel';
import { Snapshot } from '../../../../lib/utils/Snapshot';
import { DiffModel } from '../../../../lib/storage/mongoose/models/DiffModel';
import { Diff } from '../../../../lib/utils/Diff';
import { Entity } from '../../../../lib/utils/Entity';
import { Creator } from '../../../../lib/utils/Creator';
import { DeepDiff } from '../../../../lib/utils/DeepDiff';

let expect = require('expect.js');

let entity: Entity = new Entity('testObj', 'a.identificator'),
    creator: Creator = new Creator('username', 'sourceapp'),
    timestamp: Date = new Date('Dec 03 2014');
let goodSnap: Snapshot = new Snapshot({
    a: {
        good: 'snap',
        identificator: 'good'
    }
}, entity, creator, timestamp);
let badSnap: Snapshot = new Snapshot({ a: { identificator: 'good' } }, entity, creator, timestamp);
let goodDiff: Diff = new Diff([new DeepDiff('created', 'a.b', null, 'adsf')], 'good', entity, creator, timestamp);

let SnapshotDoc = {
    _id: new Types.ObjectId('123456789012345678901234'),
    __v: 1,
    metadata: {
        creator: {
            user: goodSnap.creator.user,
            source: goodSnap.creator.source
        },
        timestamp: goodSnap.timestamp.toISOString(),
        objId: goodSnap.objId
    },
    obj: goodSnap.obj
};
let DiffDoc = {
    _id: new Types.ObjectId('012345678901234567890123'),
    __v: 2,
    metadata: {
        creator: {
            user: goodDiff.creator.user,
            source: goodDiff.creator.source
        },
        timestamp: goodDiff.timestamp.toISOString(),
        objId: goodDiff.objId
    },
    obj: []
};

describe('The MongooseStorage\'s', () => {
    let config: LoggerConfig = {
        baseDir: '/path/to/logs',
        console: {
            logLevel: 'info'
        },
        file: {
            logLevel: 'debug',
            executionFile: 'server.log',
            exceptionsFile: 'error.log'
        }
    };

    let mongooseStorage: MongooseStorage = new MongooseStorage(config);
    let snapInsert: sinon.SinonSpy,
        snapUpdate: sinon.SinonSpy,
        diffInsert: sinon.SinonSpy;
    let snapRepoMock, diffRepoMock;
    before('mock repositories', () => {
        snapRepoMock = <any> sinon.mock({
            insert: (model: SnapshotModel, callback: (err: any, model?: SnapshotDocument) => void) => {
                if (hash(model.obj) === hash(goodSnap.obj)) {
                    callback(null, <SnapshotDocument> SnapshotDoc);
                } else {
                    callback(new Error('snapshot repo insert error'));
                }
            },
            updateByCondition: (cond: any, model: SnapshotModel, callback: (err: any, model?: SnapshotDocument) => void) => {
                if (hash(model.obj) === hash(goodSnap.obj)) {
                    callback(null, <SnapshotDocument> SnapshotDoc);
                } else {
                    callback(new Error('snapshot repo updateByCondition error'));
                }
            }
        });
        mongooseStorage.snapshotRepository = snapRepoMock.object;
        snapInsert = sinon.spy(mongooseStorage.snapshotRepository, 'insert');
        snapUpdate = sinon.spy(mongooseStorage.snapshotRepository, 'updateByCondition');

        diffRepoMock = <any> sinon.mock({
            insert: (model: DiffModel, callback: (err: any, model?: any) => void) => {
                if (hash(model.obj) === hash(goodDiff.obj)) {
                    callback(null, DiffDoc);
                } else {
                    callback(new Error('diff repo insert error'));
                }
            }
        });
        mongooseStorage.diffRepository = diffRepoMock.object;
        diffInsert = sinon.spy(mongooseStorage.diffRepository, 'insert');
    });
    beforeEach('reset repository insert/update spies', () => {
        snapInsert.reset();
        snapUpdate.reset();
        diffInsert.reset();
    });
    after('restore repository mocks and spies', () => {
        snapInsert.restore();
        snapUpdate.restore();
        diffInsert.restore();
        snapRepoMock.restore();
        diffRepoMock.restore();
    });

    describe('constructor', () => {
        it('should set the two repository members', () => {
            let storage: MongooseStorage = new MongooseStorage(config);
            expect(storage.snapshotRepository).to.be.ok();
            expect(storage.snapshotRepository instanceof Repository).to.be.ok();
            expect(storage.diffRepository).to.be.ok();
            expect(storage.diffRepository instanceof Repository).to.be.ok();
        });
    });
    describe('insertSnapshot method', () => {
        it('should call snapshot mongoose repo\'s insert method with correct model', (done) => {
            mongooseStorage.insertSnapshot(goodSnap, (err: Error, snapshot: Snapshot) => {
                expect(snapInsert.calledOnce).to.be.ok();
                done();
            });
        });
        it('should yield error if not successful', (done) => {
            mongooseStorage.insertSnapshot(badSnap, (err: Error, snapshot: Snapshot) => {
                expect(err).to.be.ok();
                expect(err instanceof Error).to.be.ok();
                expect(err.message).to.be('snapshot repo insert error');
                done();
            });
        });
        it('should yield snapshot with id on success', (done) => {
            mongooseStorage.insertSnapshot(goodSnap, (err: Error, snapshot: Snapshot) => {
                expect(err).not.to.be.ok();
                expect(snapshot).to.be.ok();
                expect(snapshot).to.eql(goodSnap.clone().setId('123456789012345678901234'));
                done();
            });
        });
    });
});
