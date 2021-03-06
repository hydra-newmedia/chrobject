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
import * as _ from 'lodash';
import { Repository, ResultList } from 'mongoose-repo';
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
import { FindDiffsCondition } from '../../../../lib/storage/StorageStrategy';
import { IDeepDiff } from '../../../../lib/utils/IDeepDiff';

let expect = require('expect.js');

let entity: Entity = new Entity('testObj', 'a.identificator'),
    creator: Creator = new Creator('username', 'sourceapp'),
    timestamp: Date = new Date('Dec 03 2014');
let goodSnap: Snapshot = new Snapshot({
    a: {
        good: 'snap',
        identificator: 'good'
    }
}, entity, creator, timestamp, 'good');
let badSnap: Snapshot = new Snapshot({ a: { identificator: 'bad' } }, entity, creator, timestamp, 'bad');
let goodDiff: Diff = new Diff([new DeepDiff('created', 'a.b', null, 'adsf')], 'good', entity, creator, timestamp);
let badDiff: Diff = new Diff([], 'bad', entity, creator, timestamp);

let SnapshotDoc = {
    _id: new Types.ObjectId('123456789012345678901234'),
    __v: 1,
    metadata: {
        creator: {
            user: goodSnap.creator.user,
            source: goodSnap.creator.source
        },
        entity: 'testEntity',
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
        objId: goodDiff.objId,
        linkId: SnapshotDoc._id.toHexString()
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
        snapFindById: sinon.SinonSpy,
        snapUpdate: sinon.SinonSpy,
        diffInsert: sinon.SinonSpy,
        diffFindByCond: sinon.SinonSpy;
    let snapRepoMock, diffRepoMock;
    before('mock repositories', () => {
        snapRepoMock = <any> sinon.mock({
            findById: (id: string, callback: (err: any, model?: SnapshotDocument) => void) => {
                if (id === goodSnap.id) {
                    callback(null, <SnapshotDocument> SnapshotDoc);
                } else {
                    callback(new Error('snapshot repo findById error'));
                }
            },
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
        snapFindById = sinon.spy(mongooseStorage.snapshotRepository, 'findById');
        snapInsert = sinon.spy(mongooseStorage.snapshotRepository, 'insert');
        snapUpdate = sinon.spy(mongooseStorage.snapshotRepository, 'updateByCondition');

        diffRepoMock = <any> sinon.mock({
            insert: (model: DiffModel, callback: (err: any, model?: any) => void) => {
                if (hash(model.obj) === hash(goodDiff.obj)) {
                    callback(null, DiffDoc);
                } else {
                    callback(new Error('diff repo insert error'));
                }
            },
            find: (cond: Object, callback: (err: any, models?: any) => void, limit?: number, offset?: number) => {
                let $in = _.get<string[]>(cond['metadata.objId'], '$in');
                if ($in && hash([ 'badSearch' ]) && hash($in) !== hash([ 'badSearch' ])) {
                    callback(null, new ResultList([
                        DiffDoc,
                        DiffDoc
                    ], 2));
                } else {
                    callback(new Error('diff repo find error'));
                }
            }
        });
        mongooseStorage.diffRepository = diffRepoMock.object;
        diffInsert = sinon.spy(mongooseStorage.diffRepository, 'insert');
        diffFindByCond = sinon.spy(mongooseStorage.diffRepository, 'find');
    });
    beforeEach('reset repository insert/update spies', () => {
        snapFindById.reset();
        snapInsert.reset();
        snapUpdate.reset();
        diffInsert.reset();
        diffFindByCond.reset();
    });
    after('restore repository mocks and spies', () => {
        snapFindById.restore();
        snapInsert.restore();
        snapUpdate.restore();
        diffInsert.restore();
        diffFindByCond.restore();
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
    describe('findSnapshotById method', () => {
        it('should call snapshot mongoose repo\'s findById method with the provided id', (done) => {
            mongooseStorage.findSnapshotById(goodSnap.id, entity, () => {
                expect(snapFindById.calledOnce).to.be.ok();
                expect(snapFindById.getCall(0).args[0]).to.be(goodSnap.id);
                done();
            });
        });
        it('should yield error if not successful', (done) => {
            mongooseStorage.findSnapshotById(badSnap.id, entity, (err: Error, snapshot?: Snapshot) => {
                expect(err).to.be.ok();
                expect(err instanceof Error).to.be.ok();
                expect(err.message).to.be('snapshot repo findById error');
                expect(snapshot).not.to.be.ok();
                done();
            });
        });
        it('should yield snapshot on success', (done) => {
            mongooseStorage.findSnapshotById(goodSnap.id, entity, (err: Error, snapshot?: Snapshot) => {
                expect(err).not.to.be.ok();
                expect(snapshot).to.be.ok();
                let expectedSnap: Snapshot = goodSnap.clone().setId('123456789012345678901234').setObjId('good');
                expectedSnap.entity = entity;
                expect(snapshot).to.eql(expectedSnap);
                done();
            });
        });
    });
    describe('findDiffsByCondition method', () => {
        let start: Date = new Date('2013-03-04T13:12:34.000Z'),
            end: Date = new Date('2044-02-03T12:33:44.002Z');
        it('should create correct search for objIds', (done) => {
            let condition: FindDiffsCondition = {
                    objIds: [ 'a', 'b' ]
                };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name,
                    'metadata.objId': { $in: condition.objIds }
                });
                done();
            });
        });
        it('should search without objIds', (done) => {
            let condition: FindDiffsCondition = {
                    objIds: []
                };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name
                });
                done();
            });
        });
        it('should create correct search object for timerange', (done) => {
            let condition: FindDiffsCondition = {
                timerange: {
                    start: start,
                    end: end
                }
            };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name,
                    'metadata.timestamp': {
                        $gte: start,
                        $lte: end
                    }
                });
                done();
            });
        });
        it('should search without timerange', (done) => {
            let condition: FindDiffsCondition = {
                timerange: {}
            };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name
                });
                done();
            });
        });
        it('should search with only start of timerange', (done) => {
            let condition: FindDiffsCondition = {
                timerange: {
                    start: start
                }
            };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name,
                    'metadata.timestamp': {
                        $gte: start
                    }
                });
                done();
            });
        });
        it('should search with only end of timerange', (done) => {
            let condition: FindDiffsCondition = {
                timerange: {
                    end: end
                }
            };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name,
                    'metadata.timestamp': {
                        $lte: end
                    }
                });
                done();
            });
        });
        it('should create correct search object for creator', (done) => {
            let condition: FindDiffsCondition = {
                creator: creator
            };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name,
                    'metadata.creator.user': creator.user,
                    'metadata.creator.source': creator.source
                });
                done();
            });
        });
        it('should search without creator', (done) => {
            let condition: FindDiffsCondition = {
                creator: undefined
            };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name
                });
                let condition: FindDiffsCondition = {
                    creator: null
                };
                mongooseStorage.findDiffsByCondition(condition, entity, () => {
                    expect(diffFindByCond.calledTwice).to.be.ok();
                    expect(diffFindByCond.getCall(0).args[0]).to.eql({
                        'metadata.entity': entity.name
                    });
                    done();
                });
            });
        });
        it('should call diff mongoose repo\'s find method with correct combined conditions', (done) => {
            let condition: FindDiffsCondition = {
                    objIds: [ 'a', 'b' ],
                    timerange: {
                        start: start,
                        end: end
                    },
                    creator: creator
                };
            mongooseStorage.findDiffsByCondition(condition, entity, () => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(diffFindByCond.getCall(0).args[0]).to.eql({
                    'metadata.entity': entity.name,
                    'metadata.objId': { $in: condition.objIds },
                    'metadata.timestamp': {
                        $gte: start,
                        $lte: end
                    },
                    'metadata.creator.user': creator.user,
                    'metadata.creator.source': creator.source
                });
                done();
            });
        });
        it('should yield error if not successful', (done) => {
            let condition: FindDiffsCondition = {
                objIds: [ 'badSearch' ],
                timerange: {
                    start: start,
                    end: end
                },
                creator: creator
            };
            mongooseStorage.findDiffsByCondition(condition, entity, (err, diffs) => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(err).to.be.ok();
                expect(err).to.eql(new Error('diff repo find error'));
                expect(diffs).not.to.be.ok();
                done();
            });
        });
        it('should yield array of diffs on success', (done) => {
            let condition: FindDiffsCondition = {
                objIds: [ 'goodSearch' ],
                timerange: {
                    start: start,
                    end: end
                },
                creator: creator
            };
            mongooseStorage.findDiffsByCondition(condition, entity, (err, diffs) => {
                expect(diffFindByCond.calledOnce).to.be.ok();
                expect(err).not.to.be.ok();
                expect(diffs).to.be.ok();
                let expectedDiffs: Diff[] = [];
                for (var diff of new ResultList([DiffDoc, DiffDoc], 2).items) {
                    expectedDiffs.push(new Diff(
                        <IDeepDiff[]> diff.obj,
                        diff.metadata.objId,
                        entity,
                        new Creator(diff.metadata.creator.user, diff.metadata.creator.source),
                        new Date(diff.metadata.timestamp),
                        diff._id.toHexString(),
                        diff.metadata.linkId
                    ));
                }
                expect(diffs).to.eql(expectedDiffs);
                done();
            });
        });
    });
    describe('insertSnapshot method', () => {
        it('should call snapshot mongoose repo\'s insert method with correct model', (done) => {
            mongooseStorage.insertSnapshot(goodSnap, () => {
                expect(snapInsert.calledOnce).to.be.ok();
                expect(snapInsert.getCall(0).args[0]).to.eql(new SnapshotModel(goodSnap));
                done();
            });
        });
        it('should yield error if not successful', (done) => {
            mongooseStorage.insertSnapshot(badSnap, (err: Error, snapshot: Snapshot) => {
                expect(err).to.be.ok();
                expect(err instanceof Error).to.be.ok();
                expect(err.message).to.be('snapshot repo insert error');
                expect(snapshot).not.to.be.ok();
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
    describe('upsertSnapshot method', () => {
        it('should call snapshot mongoose repo\'s updateByCondition method with correct condition and model', (done) => {
            mongooseStorage.upsertSnapshot(goodSnap, () => {
                expect(snapUpdate.calledOnce).to.be.ok();
                expect(snapUpdate.getCall(0).args[0]).to.eql({ 'metadata.entity': goodSnap.entity.name, 'metadata.objId': goodSnap.objId });
                expect(snapUpdate.getCall(0).args[1]).to.eql(new SnapshotModel(goodSnap));
                done();
            });
        });
        it('should yield error if not successful', (done) => {
            mongooseStorage.upsertSnapshot(badSnap, (err: Error, snapshot: Snapshot) => {
                expect(err).to.be.ok();
                expect(err instanceof Error).to.be.ok();
                expect(err.message).to.be('snapshot repo updateByCondition error');
                expect(snapshot).not.to.be.ok();
                done();
            });
        });
        it('should yield snapshot with id on success', (done) => {
            mongooseStorage.upsertSnapshot(goodSnap, (err: Error, snapshot: Snapshot) => {
                expect(err).not.to.be.ok();
                expect(snapshot).to.be.ok();
                expect(snapshot).to.eql(goodSnap.clone().setId('123456789012345678901234'));
                done();
            });
        });
    });
    describe('insertDiff diff', () => {
        it('should call snapshot mongoose repo\'s insert method with correct model', (done) => {
            mongooseStorage.insertDiff(goodDiff, () => {
                expect(diffInsert.calledOnce).to.be.ok();
                expect(diffInsert.getCall(0).args[0]).to.eql(new DiffModel(goodDiff));
                done();
            });
        });
        it('should yield error if not successful', (done) => {
            mongooseStorage.insertDiff(badDiff, (err: Error, diff: Diff) => {
                expect(err).to.be.ok();
                expect(err instanceof Error).to.be.ok();
                expect(err.message).to.be('diff repo insert error');
                expect(diff).not.to.be.ok();
                done();
            });
        });
        it('should yield diff with id on success', (done) => {
            mongooseStorage.insertDiff(goodDiff, (err: Error, diff: Diff) => {
                expect(err).not.to.be.ok();
                expect(diff).to.be.ok();
                expect(diff).to.eql(goodDiff.clone().setId('012345678901234567890123'));
                done();
            });
        });
    });
});
