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
import { EntryAppService } from '../../lib/appservices/EntryAppService';
import { Entity, Snapshot } from '../../lib';
import { StorageStrategy } from './mock/StorageStrategy';

let expect = require('expect.js');

describe('The EntryAppService\'s', () => {

    let eas: EntryAppService;
    let entity: Entity = new Entity('testObj', 'my.identificator');
    let storage: StorageStrategy = new StorageStrategy();

    describe('constructor', () => {
        it('should set entity and storage members', () => {
            eas = new EntryAppService(entity, storage);
            expect(eas instanceof  EntryAppService).to.be.ok();
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
            findLatestDiffBefore: sinon.SinonSpy;
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
        });
        after('restore storage mock', () => {
            insertSnapshot.restore();
            upsertSnapshot.restore();
            insertDiff.restore();
            findLatestSnapshotBefore.restore();
            findLatestDiffBefore.restore();
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
        it('should insert correctly created Diff', () => {
            // TODO: mock eas.diff/formatDiff, check that result of this mock function are inserted, check that linkId is set
        });
        it('should return object with both snapshot and diff', () => {});
    });
    // TODO: unit test eas.saveSnapshot and eas.saveDiff
    // TODO: unit test eas.diff/formatDiff as well
});
