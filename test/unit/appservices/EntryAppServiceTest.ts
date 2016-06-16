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
import { Entity, Snapshot, Diff } from '../../../lib';
import { StorageStrategy } from '../mocks/StorageStrategy';
import { DeepDiff } from '../../../lib/utils/DeepDiff';

let expect = require('expect.js');

describe('The EntryAppService\'s', () => {

    let eas: EntryAppService;
    let entity: Entity = new Entity('testObj', 'my.identificator');
    let storage: StorageStrategy = new StorageStrategy();

    describe('constructor', () => {
        it('should set entity and storage members', () => {
            eas = new EntryAppService(entity, storage);
            expect(eas instanceof EntryAppService).to.be.ok();
            expect(eas.entity).to.be.ok();
            expect(eas.entity).to.eql(entity);
            expect(eas.storage).to.be.ok();
            expect(eas.storage).to.eql(storage);
        });
    });

    describe('saveSnapshotAndDiff method', () => {
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
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp);
            });
        });
        beforeEach('reset storage mock', () => {
            insertSnapshot.reset();
            upsertSnapshot.reset();
            insertDiff.reset();
            findLatestSnapshotBefore.reset();
            findLatestDiffBefore.reset();
            diff.reset();
        });
        after('restore storage mock', () => {
            insertSnapshot.restore();
            upsertSnapshot.restore();
            insertDiff.restore();
            findLatestSnapshotBefore.restore();
            findLatestDiffBefore.restore();
            diff.restore();
        });

        it('should search for latest snapshot of correct id', () => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(findLatestSnapshotBefore.calledOnce).to.be.ok();
            let call: sinon.SinonSpyCall = findLatestSnapshotBefore.getCall(0);
            expect(call.args[0]).to.eql(_.get<string>(storage.testSnapObj, entity.idPath));
            expect(call.args[1]).to.eql(searchTimestamp);
            expect(call.args[2]).to.eql(entity);
        });
        it('should insert correctly created Snapshot', () => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(upsertSnapshot.called).not.to.be.ok();
            expect(insertSnapshot.calledOnce).to.be.ok();
            expect(insertSnapshot.getCall(0).args[0]).to.eql(new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp));
        });
        it('should diff correct Snapshots', () => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(diff.calledOnce).to.be.ok();
            let call: sinon.SinonSpyCall = diff.getCall(0);
            expect(call.args[0] instanceof Snapshot).to.be.ok();
            expect(call.args[1] instanceof Snapshot).to.be.ok();
            let oldSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, findTimestamp, '0100000000');
            expect(call.args[0]).to.eql(oldSnap);
            let newSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0011223344');
            expect(call.args[1]).to.eql(newSnap);
        });
        it('should insert correctly created Diff with linkId', () => {
            eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            let insertedDiff: Diff = new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                entity, storage.creator, findTimestamp);
            insertedDiff.linkToId('0011223344');
            expect(insertDiff.calledOnce).to.be.ok();
            let arg: Diff = insertDiff.getCall(0).args[0];
            expect(arg instanceof Diff).to.be.ok();
            expect(arg).to.eql(insertedDiff);
        });
        it('should return object with both snapshot and diff', () => {
            let result: { snapshot?: Snapshot, diff?: Diff }
                = eas.saveSnapshotAndDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            let expected: { snapshot?: Snapshot, diff?: Diff } = {
                snapshot: new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0011223344'),
                diff: new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp, '1234567890', '0011223344')
            };
            expect(result).to.eql(expected);
        });
    });

    describe('saveSnapshot method', () => {
        let insertSnapshot: sinon.SinonSpy,
            upsertSnapshot: sinon.SinonSpy;
        let searchTimestamp: Date = new Date(200000);

        before('mock storage', () => {
            insertSnapshot = sinon.spy(eas.storage, 'insertSnapshot');
            upsertSnapshot = sinon.spy(eas.storage, 'upsertSnapshot');
        });
        beforeEach('reset storage mock', () => {
            insertSnapshot.reset();
            upsertSnapshot.reset();
        });
        after('restore storage mock', () => {
            insertSnapshot.restore();
            upsertSnapshot.restore();
        });

        it('should insert correctly created Snapshot', () => {
            let insertedSnapshot: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp);
            eas.saveSnapshot(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(upsertSnapshot.called).not.to.be.ok();
            expect(insertSnapshot.calledOnce).to.be.ok();
            expect(insertSnapshot.getCall(0).args[0]).to.eql(insertedSnapshot);
        });
        it('should return snapshot object', () => {
            let result: Snapshot = eas.saveSnapshot(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(result).to.eql(new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0011223344'));
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
            diff = sinon.stub(eas, 'diff', (snapOne: Snapshot, snapTwo: Snapshot): Diff => {
                return new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                    entity, storage.creator, findTimestamp);
            });
        });
        beforeEach('reset storage mock', () => {
            insertSnapshot.reset();
            upsertSnapshot.reset();
            insertDiff.reset();
            findLatestSnapshotBefore.reset();
            findLatestDiffBefore.reset();
            diff.reset();
        });
        after('restore storage mock', () => {
            insertSnapshot.restore();
            upsertSnapshot.restore();
            insertDiff.restore();
            findLatestSnapshotBefore.restore();
            findLatestDiffBefore.restore();
            diff.restore();
        });

        it('should search for latest snapshot of correct id', () => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(findLatestSnapshotBefore.calledOnce).to.be.ok();
            let call: sinon.SinonSpyCall = findLatestSnapshotBefore.getCall(0);
            expect(call.args[0]).to.eql(_.get<string>(storage.testSnapObj, entity.idPath));
            expect(call.args[1]).to.eql(searchTimestamp);
            expect(call.args[2]).to.eql(entity);
        });
        it('should upsert correctly created Snapshot', () => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(insertSnapshot.called).not.to.be.ok();
            expect(upsertSnapshot.calledOnce).to.be.ok();
            expect(upsertSnapshot.getCall(0).args[0]).to.eql(
                new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0100000000')
            );
        });
        it('should diff correct Snapshots', () => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(diff.calledOnce).to.be.ok();
            let call: sinon.SinonSpyCall = diff.getCall(0);
            expect(call.args[0] instanceof Snapshot).to.be.ok();
            expect(call.args[1] instanceof Snapshot).to.be.ok();
            let oldSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, findTimestamp, '0100000000');
            expect(call.args[0]).to.eql(oldSnap);
            let newSnap: Snapshot = new Snapshot(storage.testSnapObj, entity, storage.creator, searchTimestamp, '0100000000');
            expect(call.args[1]).to.eql(newSnap);
        });
        it('should insert correctly created Diff without linkId', () => {
            eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            let insertedDiff: Diff = new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                entity, storage.creator, findTimestamp);
            expect(insertDiff.calledOnce).to.be.ok();
            let arg: Diff = insertDiff.getCall(0).args[0];
            expect(arg instanceof Diff).to.be.ok();
            expect(arg).to.eql(insertedDiff);
        });
        it('should return diff object', () => {
            let result: Diff = eas.saveDiff(storage.testSnapObj, storage.creator, searchTimestamp);
            expect(result).to.eql(new Diff(storage.testDiffObj, _.get<string>(storage.testSnapObj, entity.idPath),
                entity, storage.creator, findTimestamp, '1234567890'));
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
            let result = eas.deepDiff({ a: { b: 'asdf' }}, { a: { b: 'asdf', c: 'ad'} });
            expect(result).to.eql([
                new DeepDiff('created', 'a.c', null, 'ad')
            ]);
        });
        it('should detect added object properties', () => {
            let result = eas.deepDiff({ a: { b: 'asdf' }}, { a: { b: 'asdf', c: { d: 'ad' } } });
            expect(result).to.eql([
                new DeepDiff('created', 'a.c', null, { d: 'ad' })
            ]);
        });
        it('should detect edited properties', () => {
            let result = eas.deepDiff({ a: { b: 'asdf', c: 1 }}, { a: { b: 'df', c: 'ad'} });
            expect(result).to.eql([
                new DeepDiff('edited', 'a.b', 'asdf', 'df'),
                new DeepDiff('edited', 'a.c', 1, 'ad')
            ]);
        });
        it('should detect deleted properties', () => {
            let result = eas.deepDiff({ a: { b: 'asdf', c: 1 }}, { a: { b: 'asdf', } });
            expect(result).to.eql([
                new DeepDiff('deleted', 'a.c', 1, null)
            ]);
        });
        it('should detect deleted object properties', () => {
            let result = eas.deepDiff({ a: { b: 'asdf', c: { d: 'ad' } } }, { a: { b: 'asdf' } });
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
        it('should detect all in combination', () => {
            let result = eas.deepDiff(storage.testSnapObj, storage.testSnapObj2);
            expect(result).to.eql(storage.testDiffObj);
        });
    });
});
