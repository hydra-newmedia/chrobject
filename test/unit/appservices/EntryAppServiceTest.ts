/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 13.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import * as sinon from 'sinon';
import * as _ from 'lodash';
import { EntryAppService } from '../../../lib/appservices/EntryAppService';
import { Entity, Snapshot, Diff, ChrobjectOptions } from '../../../lib';
import { StorageStrategy } from '../mocks/StorageStrategy';
import { DeepDiff } from '../../../lib/utils/DeepDiff';
import { FindDiffsCondition } from '../../../lib/storage/StorageStrategy';
import { Creator } from '../../../lib/utils/Creator';

let expect = require('expect.js');

describe('The EntryAppService\'s', () => {

    let eas: EntryAppService;
    let entity: Entity = new Entity('testObj', 'my.identificator');
    let storage: StorageStrategy = new StorageStrategy();
    let options: ChrobjectOptions = {
        ignoreProperties: [
            'data.ignored'
        ]
    };

    describe('constructor', () => {
        it('should set entity and storage members', () => {
            eas = new EntryAppService(entity, storage, options);
            expect(eas instanceof EntryAppService).to.be.ok();
            expect(eas.entity).to.be.ok();
            expect(eas.entity).to.eql(entity);
            expect(eas.storage).to.be.ok();
            expect(eas.storage).to.eql(storage);
            expect(eas.options).to.be.ok();
            expect(eas.options).to.eql(options);
        });
        it('should fallback to default options if non specified', () => {
            eas = new EntryAppService(entity, storage);
            expect(eas instanceof EntryAppService).to.be.ok();
            expect(eas.options).to.be.ok();
            expect(eas.options).to.eql({ ignoreProperties: [] });
        });
    });

    describe('getDiffs method', () => {
        let findDiffsByCondition: sinon.SinonSpy;

        before('mock storage', () => {
            findDiffsByCondition = sinon.spy(eas.storage, 'findDiffsByCondition');
        });
        beforeEach('reset storage mock', () => {
            findDiffsByCondition.reset();
        });
        after('restore storage mock', () => {
            findDiffsByCondition.restore();
        });

        it('should search with empty condition if none was given', (done) => {
            eas.getDiffs(null, () => {
                expect(findDiffsByCondition.calledOnce).to.be.ok();
                expect(findDiffsByCondition.getCall(0).args[0]).to.eql({});
                expect(findDiffsByCondition.getCall(0).args[1]).to.eql(entity);
                done();
            });
        });

        it('should call findDiffsByCondition method of repo with correct condition', (done) => {
            let creator: Creator = new Creator('username', 'sourceapp'),
                condition: FindDiffsCondition = {
                    objIds: ['a', 'b'],
                    timerange: {
                        start: new Date('2013-03-04T13:12:34.000Z'),
                        end: new Date('2044-02-03T12:33:44.002Z')
                    },
                    creator: creator
                };
            eas.getDiffs(condition, () => {
                expect(findDiffsByCondition.calledOnce).to.be.ok();
                expect(findDiffsByCondition.getCall(0).args[0]).to.be(condition);
                expect(findDiffsByCondition.getCall(0).args[1]).to.eql(entity);
                done();
            });
        });
    });

    describe('getSnapshotById method', () => {
        let findSnapshotById: sinon.SinonSpy;

        before('mock storage', () => {
            findSnapshotById = sinon.spy(eas.storage, 'findSnapshotById');
        });
        beforeEach('reset storage mock', () => {
            findSnapshotById.reset();
        });
        after('restore storage mock', () => {
            findSnapshotById.restore();
        });

        it('should call findById method of repo with correct id', (done) => {
            eas.getSnapshotById('myVerySpecialId', () => {
                expect(findSnapshotById.calledOnce).to.be.ok();
                expect(findSnapshotById.getCall(0).args[0]).to.be('myVerySpecialId');
                done();
            });
        });
    });

    describe('saveSnapshotAndDiff method', () => {
        let insertSnapshot: sinon.SinonSpy,
            upsertSnapshot: sinon.SinonSpy,
            insertDiff: sinon.SinonSpy,
            findLatestSnapshotBefore: sinon.SinonSpy,
            findLatestDiffBefore: sinon.SinonSpy,
            diff: sinon.SinonStub;
        let searchTimestamp: Date = new Date(200000),
            findTimestamp: Date = storage.oneMinuteBefore(searchTimestamp);

        before('mock storage', () => {
            insertSnapshot = sinon.spy(eas.storage, 'insertSnapshot');
            upsertSnapshot = sinon.spy(eas.storage, 'upsertSnapshot');
            insertDiff = sinon.spy(eas.storage, 'insertDiff');
            findLatestSnapshotBefore = sinon.spy(eas.storage, 'findLatestSnapshotBefore');
            findLatestDiffBefore = sinon.spy(eas.storage, 'findLatestDiffBefore');
        });
        beforeEach('reset storage mock', () => {
            insertSnapshot.reset();
            upsertSnapshot.reset();
            insertDiff.reset();
            findLatestSnapshotBefore.reset();
            findLatestDiffBefore.reset();
            if (diff) {
                diff.restore();
            }
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp);
            });
        });
        after('restore storage mock', () => {
            insertSnapshot.restore();
            upsertSnapshot.restore();
            insertDiff.restore();
            findLatestSnapshotBefore.restore();
            findLatestDiffBefore.restore();
            diff.restore();
        });

        it('should search for latest snapshot of correct id', (done) => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(findLatestSnapshotBefore.calledOnce).to.be.ok();
                let call: sinon.SinonSpyCall = findLatestSnapshotBefore.getCall(0);
                expect(call.args[0]).to.eql(_.get<string>(storage.testSnapObj, entity.idPath));
                expect(call.args[1]).to.eql(searchTimestamp);
                expect(call.args[2]).to.eql(entity);
                done();
            });
        });
        it('should insert correctly created Snapshot', (done) => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(upsertSnapshot.called).not.to.be.ok();
                expect(insertSnapshot.calledOnce).to.be.ok();
                expect(insertSnapshot.getCall(0).args[0]).to.eql(
                    new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp)
                );
                done();
            });
        });
        it('should diff correct Snapshots', (done) => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(diff.calledOnce).to.be.ok();
                let call: sinon.SinonSpyCall = diff.getCall(0);
                expect(call.args[0] instanceof Snapshot).to.be.ok();
                expect(call.args[1] instanceof Snapshot).to.be.ok();
                let oldSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, findTimestamp, '0100000000');
                expect(call.args[0]).to.eql(oldSnap);
                let newSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp);
                expect(call.args[1]).to.eql(newSnap);
                done();
            });
        });
        it('should not insert snapshot nor diff if snaps don\'t differ', (done) => {
            diff.restore();
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff([], _.get<string>(storage.testSnapObj, entity.idPath), entity, storage.creator, findTimestamp);
            });
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(diff.calledOnce).to.be.ok();
                expect(insertDiff.called).not.to.be.ok();
                expect(insertSnapshot.called).not.to.be.ok();
                expect(upsertSnapshot.called).not.to.be.ok();
                done();
            });
        });
        it('should insert correctly created Diff with linkId', (done) => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                let insertedDiff: Diff = new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp);
                insertedDiff.linkToId('0011223344');
                expect(insertDiff.calledOnce).to.be.ok();
                let arg: Diff = insertDiff.getCall(0).args[0];
                expect(arg instanceof Diff).to.be.ok();
                expect(arg).to.eql(insertedDiff);
                done();
            });
        });
        it('should create diff to {}-object if no older snap of that object', (done) => {
            let testObj: Object = _.cloneDeep(storage.testSnapObj);
            _.set(testObj, 'my.identificator', 'noSnapBefore');
            eas.saveSnapshotAndDiff(testObj, storage.creator, searchTimestamp, (err: Error) => {
                    expect(err).not.to.be.ok();
                    expect(diff.calledOnce).to.be.ok();
                    expect(diff.getCall(0).args[0]).to.eql(
                        (new Snapshot({}, entity, storage.creator, searchTimestamp)).setObjId('noSnapBefore')
                    );
                    expect(diff.getCall(0).args[1]).to.eql(new Snapshot(testObj, entity, storage.creator, searchTimestamp));
                    done();
                }
            );
        });
        it('should return object with both snapshot and diff', (done) => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp,
                (err: Error, result: { snapshot?: Snapshot, diff?: Diff }) => {
                    expect(err).not.to.be.ok();
                    let expected: { snapshot?: Snapshot, diff?: Diff } = {
                        snapshot: new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0011223344'),
                        diff: new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                            entity, storage.creator, findTimestamp, '1234567890', '0011223344')
                    };
                    expect(result).to.eql(expected);
                    done();
                }
            );
        });
    });

    describe('saveSnapshot method', () => {
        let insertSnapshot: sinon.SinonSpy,
            upsertSnapshot: sinon.SinonSpy,
            findLatestSnapshotBefore: sinon.SinonSpy,
            diff: sinon.SinonStub;
        let searchTimestamp: Date = new Date(200000),
            findTimestamp: Date = storage.oneMinuteBefore(searchTimestamp);

        before('mock storage', () => {
            insertSnapshot = sinon.spy(eas.storage, 'insertSnapshot');
            upsertSnapshot = sinon.spy(eas.storage, 'upsertSnapshot');
            findLatestSnapshotBefore = sinon.spy(eas.storage, 'findLatestSnapshotBefore');
        });
        beforeEach('reset storage mock', () => {
            insertSnapshot.reset();
            upsertSnapshot.reset();
            findLatestSnapshotBefore.reset();
            if (diff) {
                diff.restore();
            }
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp);
            });
        });
        after('restore storage mock', () => {
            insertSnapshot.restore();
            upsertSnapshot.restore();
            findLatestSnapshotBefore.restore();
            diff.restore();
        });

        it('should search for latest snapshot of correct id', (done) => {
            eas.saveSnapshot(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(findLatestSnapshotBefore.calledOnce).to.be.ok();
                let call: sinon.SinonSpyCall = findLatestSnapshotBefore.getCall(0);
                expect(call.args[0]).to.eql(_.get<string>(storage.testSnapObj, entity.idPath));
                expect(call.args[1]).to.eql(searchTimestamp);
                expect(call.args[2]).to.eql(entity);
                done();
            });
        });
        it('should insert correctly created Snapshot', (done) => {
            eas.saveSnapshot(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(upsertSnapshot.called).not.to.be.ok();
                expect(insertSnapshot.calledOnce).to.be.ok();
                expect(insertSnapshot.getCall(0).args[0]).to.eql(
                    new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp)
                );
                done();
            });
        });
        it('should diff correct Snapshots', (done) => {
            eas.saveSnapshot(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(diff.calledOnce).to.be.ok();
                let call: sinon.SinonSpyCall = diff.getCall(0);
                expect(call.args[0] instanceof Snapshot).to.be.ok();
                expect(call.args[1] instanceof Snapshot).to.be.ok();
                let oldSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, findTimestamp, '0100000000');
                expect(call.args[0]).to.eql(oldSnap);
                let newSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp);
                expect(call.args[1]).to.eql(newSnap);
                done();
            });
        });
        it('should not insert snapshot if snaps don\'t differ', (done) => {
            diff.restore();
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff([], _.get<string>(storage.testSnapObj, entity.idPath), entity, storage.creator, findTimestamp);
            });
            eas.saveSnapshot(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(diff.calledOnce).to.be.ok();
                expect(insertSnapshot.called).not.to.be.ok();
                expect(upsertSnapshot.called).not.to.be.ok();
                done();
            });
        });
        it('should create diff to {}-object if no older snap of that object', (done) => {
            let testObj: Object = _.cloneDeep(storage.testSnapObj);
            _.set(testObj, 'my.identificator', 'noSnapBefore');
            eas.saveSnapshot(testObj, storage.creator, searchTimestamp, (err: Error) => {
                    expect(err).not.to.be.ok();
                    expect(diff.calledOnce).to.be.ok();
                    expect(diff.getCall(0).args[0]).to.eql(
                        (new Snapshot({}, entity, storage.creator, searchTimestamp)).setObjId('noSnapBefore')
                    );
                    expect(diff.getCall(0).args[1]).to.eql(new Snapshot(testObj, entity, storage.creator, searchTimestamp));
                    done();
                }
            );
        });
        it('should return snapshot object', (done) => {
            eas.saveSnapshot(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error, result: Snapshot) => {
                expect(err).not.to.be.ok();
                expect(result).to.eql(new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0011223344'));
                done();
            });
        });
    });

    describe('saveDiff method', () => {
        let insertSnapshot: sinon.SinonSpy,
            upsertSnapshot: sinon.SinonSpy,
            insertDiff: sinon.SinonSpy,
            findLatestSnapshotBefore: sinon.SinonSpy,
            findLatestDiffBefore: sinon.SinonSpy,
            diff: sinon.SinonSpy;
        let searchTimestamp: Date = new Date(200000),
            findTimestamp: Date = storage.oneMinuteBefore(searchTimestamp);

        before('mock storage', () => {
            insertSnapshot = sinon.spy(eas.storage, 'insertSnapshot');
            upsertSnapshot = sinon.spy(eas.storage, 'upsertSnapshot');
            insertDiff = sinon.spy(eas.storage, 'insertDiff');
            findLatestSnapshotBefore = sinon.spy(eas.storage, 'findLatestSnapshotBefore');
            findLatestDiffBefore = sinon.spy(eas.storage, 'findLatestDiffBefore');
        });
        beforeEach('reset storage mock', () => {
            insertSnapshot.reset();
            upsertSnapshot.reset();
            insertDiff.reset();
            findLatestSnapshotBefore.reset();
            findLatestDiffBefore.reset();
            if (diff) {
                diff.restore();
            }
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp);
            });
        });
        after('restore storage mock', () => {
            insertSnapshot.restore();
            upsertSnapshot.restore();
            insertDiff.restore();
            findLatestSnapshotBefore.restore();
            findLatestDiffBefore.restore();
            diff.restore();
        });

        it('should search for latest snapshot of correct id', (done) => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(findLatestSnapshotBefore.calledOnce).to.be.ok();
                let call: sinon.SinonSpyCall = findLatestSnapshotBefore.getCall(0);
                expect(call.args[0]).to.eql(_.get<string>(storage.testSnapObj, entity.idPath));
                expect(call.args[1]).to.eql(searchTimestamp);
                expect(call.args[2]).to.eql(entity);
                done();
            });
        });
        it('should upsert correctly created Snapshot', (done) => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(insertSnapshot.called).not.to.be.ok();
                expect(upsertSnapshot.calledOnce).to.be.ok();
                expect(upsertSnapshot.getCall(0).args[0]).to.eql(
                    new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0100000000')
                );
                done();
            });
        });
        it('should diff correct Snapshots', (done) => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(diff.calledOnce).to.be.ok();
                let call: sinon.SinonSpyCall = diff.getCall(0);
                expect(call.args[0] instanceof Snapshot).to.be.ok();
                expect(call.args[1] instanceof Snapshot).to.be.ok();
                let oldSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, findTimestamp, '0100000000');
                expect(call.args[0]).to.eql(oldSnap);
                let newSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0100000000');
                expect(call.args[1]).to.eql(newSnap);
                done();
            });
        });
        it('should not insert diff if snaps don\'t differ', (done) => {
            diff.restore();
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff([], _.get<string>(storage.testSnapObj, entity.idPath), entity, storage.creator, findTimestamp);
            });
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error) => {
                expect(err).not.to.be.ok();
                expect(diff.calledOnce).to.be.ok();
                expect(insertDiff.called).not.to.be.ok();
                done();
            });
        });
        it('should insert correctly created Diff without linkId', (done) => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp, () => {
                let insertedDiff: Diff = new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp);
                expect(insertDiff.calledOnce).to.be.ok();
                let arg: Diff = insertDiff.getCall(0).args[0];
                expect(arg instanceof Diff).to.be.ok();
                expect(arg).to.eql(insertedDiff);
                done();
            });
        });
        it('should create diff to {}-object if no older snap of that object', (done) => {
            let testObj: Object = _.cloneDeep(storage.testSnapObj);
            _.set(testObj, 'my.identificator', 'noSnapBefore');
            eas.saveDiff(testObj, storage.creator, searchTimestamp, (err: Error) => {
                    expect(err).not.to.be.ok();
                    expect(diff.calledOnce).to.be.ok();
                    expect(diff.getCall(0).args[0]).to.eql(
                        (new Snapshot({}, entity, storage.creator, searchTimestamp)).setObjId('noSnapBefore')
                    );
                    expect(diff.getCall(0).args[1]).to.eql(new Snapshot(testObj, entity, storage.creator, searchTimestamp));
                    done();
                }
            );
        });
        it('should return diff object', (done) => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp, (err: Error, result: Diff) => {
                expect(err).not.to.be.ok();
                expect(result).to.eql(new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp, '1234567890'));
                done();
            });
        });
    });

    describe('diff method', () => {
        let deepDiff: sinon.SinonSpy;

        let snapOne: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, new Date('Dec 5, 1995')),
            snapTwo: Snapshot = new Snapshot(storage.testSnapObj2, entity, storage.creator, new Date('Dec 25, 1995'));

        before('spy deepDiff method', () => {
            deepDiff = sinon.spy(eas, 'deepDiff');
        });
        beforeEach('reset deepDiff spy', () => {
            deepDiff.reset();
        });
        after('restore deepDiff spy', () => {
            deepDiff.restore();
        });

        it('should throw an error if the object ids differ', (done) => {
            let one = snapOne.clone();
            one.objId = '00000000';
            expect(eas.diff).withArgs(one, snapTwo).to.throwError((err) => {
                expect(err).to.be.ok();
                expect(err).to.eql(new Error('Diffed snapshots are not of same object'));
                done();
            });
        });
        it('should throw an error if the entities differ', (done) => {
            let one = snapOne.clone();
            one.entity = new Entity('someDifferingObjClass', 'different.id.path');
            expect(eas.diff).withArgs(one, snapTwo).to.throwError((err) => {
                expect(err).to.be.ok();
                expect(err).to.eql(new Error('Diffed snapshots are not of same entity'));
                done();
            });
        });
        it('should swap the snapshots if wrong timebased order', () => {
            eas.diff(snapTwo, snapOne);
            expect(deepDiff.calledThrice).to.be.ok(); // recursion
            expect(deepDiff.getCall(0).args[0]).to.eql(snapOne.obj);
            expect(deepDiff.getCall(0).args[1]).to.eql(snapTwo.obj);
        });
        it('should return correctly created Diff object', () => {
            let result = eas.diff(snapOne, snapTwo);
            expect(result instanceof Diff).to.be.ok();
            expect(result).to.eql(
                new Diff(eas.deepDiff(snapOne.obj, snapTwo.obj), snapTwo.objId, snapTwo.entity, snapTwo.creator, snapTwo.timestamp)
            );
        });
    });

    describe('deepDiff method', () => {
        it('should return an empty array if no differences', () => {
            let result = eas.deepDiff(storage.testSnapObj, storage.testSnapObj);
            expect(result).to.eql([]);
        });
        it('should detect added properties', () => {
            let result = eas.deepDiff({ a: { b: 'asdf' } }, {
                a: {
                    b: 'asdf',
                    c: 'ad'
                }
            });
            expect(result).to.eql([
                new DeepDiff('created', 'a.c', null, 'ad')
            ]);
        });
        it('should detect added object properties', () => {
            let result = eas.deepDiff({ a: { b: 'asdf' } }, {
                a: {
                    b: 'asdf',
                    c: { d: 'ad' },
                    arr: 'asdfa'.split('')
                }
            });
            expect(result).to.eql([
                new DeepDiff('created', 'a.c', null, { d: 'ad' }),
                new DeepDiff('created', 'a.arr', null, 'asdfa'.split(''))
            ]);
        });
        it('should detect edited properties', () => {
            let result = eas.deepDiff({
                a: {
                    b: 'asdf',
                    c: 1
                }
            }, { a: { b: 'df', c: 'ad' } });
            expect(result).to.eql([
                new DeepDiff('edited', 'a.b', 'asdf', 'df'),
                new DeepDiff('edited', 'a.c', 1, 'ad')
            ]);
        });
        it('should detect deleted properties', () => {
            let result = eas.deepDiff({
                a: {
                    b: 'asdf',
                    c: 1,
                    arr: 'asdf'.split('')
                }
            }, { a: { b: 'asdf' } });
            expect(result).to.eql([
                new DeepDiff('deleted', 'a.c', 1, null),
                new DeepDiff('deleted', 'a.arr', 'asdf'.split(''), null)
            ]);
        });
        it('should detect deleted object properties', () => {
            let result = eas.deepDiff({
                a: {
                    b: 'asdf',
                    c: { d: 'ad' }
                }
            }, { a: { b: 'asdf' } });
            expect(result).to.eql([
                new DeepDiff('deleted', 'a.c', { d: 'ad' }, null)
            ]);
        });
        it('should notice array property changes', () => {
            let result = eas.deepDiff({ a: { arr: ['a', 'b', 'c', 'd', 'e'] } }, { a: { arr: ['a', 'c', 'f', 'e', 'x'] } });
            expect(result).to.eql([
                new DeepDiff('array', 'a.arr', ['a', 'b', 'c', 'd', 'e'], ['a', 'c', 'f', 'e', 'x'])
            ]);
        });
        it('should notice array order changes', () => {
            let result = eas.deepDiff({ a: { arr: ['a', 'b', 'c', 'd', 'e'] } }, { a: { arr: ['b', 'a', 'c', 'd', 'e'] } });
            expect(result).to.eql([
                new DeepDiff('array', 'a.arr', ['a', 'b', 'c', 'd', 'e'], ['b', 'a', 'c', 'd', 'e'])
            ]);
        });
        it('should detect all in combination', () => {
            let result = eas.deepDiff(storage.testSnapObj, storage.testSnapObj2);
            expect(result).to.eql(storage.testDiffObj);
        });
        it('should ignore ignoreProperties', () => {
            // set options (ignore Properties)
            eas.options = options;
            _.set(storage.testSnapObj, 'data.ignored', 'aVal');
            _.set(storage.testSnapObj2, 'data.ignored', 'aDifferentVal');
            // actual testing
            let result = eas.deepDiff(storage.testSnapObj, storage.testSnapObj2);
            expect(result).to.eql(storage.testDiffObj);
            // reset options to emtpy object
            eas.options = {};
            _.unset(storage.testSnapObj, 'data.ignored');
            _.unset(storage.testSnapObj2, 'data.ignored');
        });
    });
});
