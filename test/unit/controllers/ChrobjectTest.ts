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
import * as _ from 'lodash';
import {
    default as Chrobject,
    StorageStrategy as LibStorageStrategy,
    Entity,
    Configuration,
    Snapshot,
    Diff,
    Creator,
    ChrobjectOptions
} from '../../../lib';
import { EntryAppService } from '../../../lib/appservices/EntryAppService';
import * as sinon from 'sinon';
import { StorageStrategy } from '../mocks/StorageStrategy';
import { IDeepDiff } from '../../../lib/utils/IDeepDiff';
import { DeepDiff } from '../../../lib/utils/DeepDiff';
import { FindDiffsCondition } from '../../../lib/storage/StorageStrategy';

let expect = require('expect.js');

describe('The Chrobject\'s', () => {

    let chrobject: Chrobject;
    let config: Configuration;
    let entity = new Entity('testObj', 'my.identificator');
    let storage: LibStorageStrategy = new StorageStrategy();
    let options: ChrobjectOptions = {
        ignoreProperties: [
            'data.ignored'
        ]
    };

    before('setup Chrobject instance', () => {
        config = Configuration.SNAP_AND_DIFF;
        chrobject = new Chrobject(entity, config, storage, options);
    });

    describe('constructor', () => {
        it('should set members by parameters', () => {
            expect(chrobject).to.be.ok();
            expect(chrobject.entity).to.be.ok();
            expect(chrobject.entity).to.eql(entity);
            expect(chrobject.config).to.eql(config);
            expect(chrobject.appService).to.be.ok();
            expect(chrobject.appService).to.eql(new EntryAppService(entity, storage, options));
        });
    });

    describe('getDiffs method', () => {
        let ASGetDiffs: sinon.SinonSpy;
        before('setup spy', () => {
            ASGetDiffs = sinon.spy(chrobject.appService, 'getDiffs');
        });
        afterEach('reset spy', () => {
            ASGetDiffs.reset();
        });
        after('restore spy', () => {
            ASGetDiffs.restore();
        });
        it('should call getDiffs method of app service', (done) => {
            let creator: Creator = new Creator('username', 'sourceapp'),
                condition: FindDiffsCondition = {
                    objIds: ['a', 'b'],
                    timerange: {
                        start: new Date('2013-03-04T13:12:34.000Z'),
                        end: new Date('2044-02-03T12:33:44.002Z')
                    },
                    creator: creator
                };
            chrobject.getDiffs(condition, () => {
                expect(ASGetDiffs.calledOnce).to.be.ok();
                expect(ASGetDiffs.getCall(0).args[0]).to.be(condition);
                done();
            });
        });
    });

    describe('getSnapshotById method', () => {
        let ASGetSnapById: sinon.SinonSpy;
        before('setup spy', () => {
            ASGetSnapById = sinon.spy(chrobject.appService, 'getSnapshotById');
        });
        afterEach('reset spy', () => {
            ASGetSnapById.reset();
        });
        after('restore spy', () => {
            ASGetSnapById.restore();
        });
        it('should call getSnapshotById method of app service', (done) => {
            chrobject.getSnapshotById('specialId', () => {
                expect(ASGetSnapById.calledOnce).to.be.ok();
                expect(ASGetSnapById.getCall(0).args[0]).to.eql('specialId');
                done();
            });
        });
    });

    describe('saveEntry method', () => {
        let creator: Creator = new Creator('userName', 'sourceApp'),
            timestamp: Date = new Date(),
            testObj: Object = {
                my: {
                    identificator: 'abcdef'
                },
                data: {
                    a: 'aValue',
                    no: 'nope'
                },
                arr: ['a', 'b', 'd']
            },
            testDiff: IDeepDiff[] = [
                new DeepDiff('created', 'data.test', null, 'testValue')
            ];
        let saveSnapAndDiff: sinon.SinonStub, saveSnapOnly: sinon.SinonStub, saveDiffOnly: sinon.SinonStub;
        before('mock appservice', () => {
            let entity = new Entity('testObj', 'my.identificator');
            saveSnapAndDiff = sinon.stub(chrobject.appService, 'saveSnapshotAndDiff',
                (obj: Object, creator: Creator, timestamp: Date,
                 callback: (err: Error, result: { snapshot: Snapshot, diff: Diff }) => void) => {
                    callback(null, {
                        snapshot: new Snapshot(obj, entity, creator, timestamp, '0123456789'),
                        diff: new Diff(testDiff, _.get<string>(obj, entity.idPath), entity, creator, timestamp, '1234567890', '0123456789')
                    });
                }
            );
            saveSnapOnly = sinon.stub(chrobject.appService, 'saveSnapshot',
                (obj: Object, creator: Creator, timestamp: Date, callback: (err: Error, snapshot: Snapshot) => void) => {
                    callback(null, new Snapshot(obj, entity, creator, timestamp, '0123456789'));
                }
            );
            saveDiffOnly = sinon.stub(chrobject.appService, 'saveDiff',
                (obj: Object, creator: Creator, timestamp: Date, callback: (err: Error, diff: Diff) => void) => {
                    callback(null, new Diff(testDiff, _.get<string>(obj, entity.idPath), entity, creator, timestamp, '1234567890'));
                }
            );
        });
        beforeEach('reset appservice mock', () => {
            saveSnapAndDiff.reset();
            saveSnapOnly.reset();
            saveDiffOnly.reset();
        });
        after('restore appservice mock', () => {
            saveSnapAndDiff.restore();
            saveSnapOnly.restore();
            saveDiffOnly.restore();
        });

        it('should use correct method saveSnapshotAndDiff of appservice when configured', (done) => {
            chrobject.config = Configuration.SNAP_AND_DIFF;
            chrobject.saveEntry(testObj, creator, timestamp, (err: Error, savedEntry: { snapshot?: Snapshot, diff?: Diff }) => {
                expect(err).not.to.be.ok();
                expect(saveSnapAndDiff.calledOnce).to.be.ok();
                expect(saveSnapAndDiff.getCall(0).args[0]).to.eql(testObj);
                expect(saveSnapAndDiff.getCall(0).args[1]).to.eql(creator);
                expect(saveSnapAndDiff.getCall(0).args[2]).to.eql(timestamp);
                expect(saveDiffOnly.called).not.to.be.ok();
                expect(saveSnapOnly.called).not.to.be.ok();
                expect(savedEntry).to.be.ok();
                expect(savedEntry).to.be.an('object');
                expect(savedEntry.snapshot instanceof Snapshot).to.be.ok();
                expect(savedEntry.snapshot).to.eql(new Snapshot(testObj, entity, creator, timestamp, '0123456789'));
                expect(savedEntry.diff instanceof Diff).to.be.ok();
                expect(savedEntry.diff).to.eql(
                    new Diff(testDiff, _.get<string>(testObj, entity.idPath), entity, creator, timestamp, '1234567890', '0123456789')
                );
                done();
            });
        });
        it('should use correct method saveDiff of appservice when configured', (done) => {
            chrobject.config = Configuration.DIFF_ONLY;
            chrobject.saveEntry(testObj, creator, timestamp, (err: Error, savedEntry: { snapshot?: Snapshot, diff?: Diff }) => {
                expect(err).not.to.be.ok();
                expect(saveDiffOnly.calledOnce).to.be.ok();
                expect(saveDiffOnly.getCall(0).args[0]).to.eql(testObj);
                expect(saveDiffOnly.getCall(0).args[1]).to.eql(creator);
                expect(saveDiffOnly.getCall(0).args[2]).to.eql(timestamp);
                expect(saveSnapAndDiff.called).not.to.be.ok();
                expect(saveSnapOnly.called).not.to.be.ok();
                expect(savedEntry.diff instanceof Diff).to.be.ok();
                expect(savedEntry.diff).to.eql(
                    new Diff(testDiff, _.get<string>(testObj, entity.idPath), entity, creator, timestamp, '1234567890')
                );
                expect(savedEntry.snapshot).not.to.be.ok();
                done();
            });
        });
        it('should use correct method saveSnapshot of appservice when configured', (done) => {
            chrobject.config = Configuration.SNAP_ONLY;
            chrobject.saveEntry(testObj, creator, timestamp, (err: Error, savedEntry: { snapshot?: Snapshot, diff?: Diff }) => {
                expect(err).not.to.be.ok();
                expect(saveSnapOnly.calledOnce).to.be.ok();
                expect(saveSnapOnly.getCall(0).args[0]).to.eql(testObj);
                expect(saveSnapOnly.getCall(0).args[1]).to.eql(creator);
                expect(saveSnapOnly.getCall(0).args[2]).to.eql(timestamp);
                expect(saveSnapAndDiff.called).not.to.be.ok();
                expect(saveDiffOnly.called).not.to.be.ok();
                expect(savedEntry.snapshot instanceof Snapshot).to.be.ok();
                expect(savedEntry.snapshot).to.eql(new Snapshot(testObj, entity, creator, timestamp, '0123456789'));
                expect(savedEntry.diff).not.to.be.ok();
                done();
            });
        });
        it('should set timestamp to \'now\' if not assigned', () => {
            chrobject.config = Configuration.DIFF_ONLY;
            chrobject.saveEntry(testObj, creator);
            expect(saveDiffOnly.calledOnce).to.be.ok();
            expect(saveDiffOnly.getCall(0).args[0]).to.eql(testObj);
            expect(saveDiffOnly.getCall(0).args[1]).to.eql(creator);
            // expect date to be approximately 'now' (± 10,000 ms)
            expect(Math.abs(saveDiffOnly.getCall(0).args[2].valueOf() - (new Date()).valueOf())).to.be.lessThan(10000);
            expect(saveSnapAndDiff.called).not.to.be.ok();
            expect(saveSnapOnly.called).not.to.be.ok();
        });

    });
});
