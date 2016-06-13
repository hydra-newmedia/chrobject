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
import {
    Chrobject,
    Entity,
    Configuration,
    Snapshot,
    Diff,
    Creator
} from '../../lib';
import { EntryAppService } from '../../lib/appservices/EntryAppService';
import * as sinon from 'sinon';

let expect = require('expect.js');

describe('The Chrobject\'s', () => {

    let chrobject: Chrobject;
    let entity = new Entity('testObj', 'my.identificator');

    describe('constructor', () => {
        it('should set members by parameters', () => {
            let config = Configuration.SNAP_AND_DIFF;
            chrobject = new Chrobject(entity, config);
            expect(chrobject).to.be.ok();
            expect(chrobject.entity).to.be.ok();
            expect(chrobject.entity).to.eql(entity);
            expect(chrobject.config).to.eql(config);
            expect(chrobject.appService).to.be.ok();
            expect(chrobject.appService).to.eql(new EntryAppService(entity));
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
            testDiffObjArr: Object[] = [
                {
                    action: 'created',
                    created: true,
                    propertyPath: 'data.b',
                    newValue: 'createdValue'
                },
                {
                    action: 'edited',
                    edited: true,
                    propertyPath: 'data.a',
                    oldValue: 'aValue',
                    newValue: 'aEditedValue'
                },
                {
                    action: 'deleted',
                    deleted: true,
                    propertyPath: 'data.no',
                    oldValue: 'nope',
                },
                {
                    action: 'added',
                    edited: true,
                    propertyPath: 'arr',
                    newValue: 'c'
                },
                {
                    action: 'removed',
                    edited: true,
                    propertyPath: 'arr',
                    oldValue: 'd'
                }
            ];
        let saveSnapAndDiff: sinon.SinonStub, saveSnapOnly: sinon.SinonStub, saveDiffOnly: sinon.SinonStub;
        before('mock appservice', () => {
            let entity = new Entity('testObj', 'my.identificator');
            saveSnapAndDiff = sinon.stub(chrobject.appService, 'saveSnapshotAndDiff',
                (obj: Object, creator: Creator, timestamp: Date): { snapshot: Snapshot, diff: Diff } => {
                    return {
                        snapshot: new Snapshot(obj, entity, creator, timestamp, '0123456789'),
                        diff: new Diff(obj, entity, creator, timestamp, '1234567890', '0123456789')
                    };
                }
            );
            saveSnapOnly = sinon.stub(chrobject.appService, 'saveSnapshot',
                (obj: Object, creator: Creator, timestamp: Date): Snapshot => {
                    return new Snapshot(obj, entity, creator, timestamp, '0123456789');
                }
            );
            saveDiffOnly = sinon.stub(chrobject.appService, 'saveDiff',
                (obj: Object, creator: Creator, timestamp: Date): Diff => {
                    return new Diff(obj, entity, creator, timestamp, '1234567890');
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

        it('should use correct method saveSnapshotAndDiff of appservice when configured', () => {
            chrobject.config = Configuration.SNAP_AND_DIFF;
            let savedEntry: { snapshot?: Snapshot, diff?: Diff } = chrobject.saveEntry(testObj, creator, timestamp);
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
            expect(savedEntry.diff).to.eql(new Diff(testObj, entity, creator, timestamp, '1234567890', '0123456789'));
        });
        it('should use correct method saveDiff of appservice when configured', () => {
            chrobject.config = Configuration.DIFF_ONLY;
            let savedEntry: { snapshot?: Snapshot, diff?: Diff } = chrobject.saveEntry(testObj, creator, timestamp);
            expect(saveDiffOnly.calledOnce).to.be.ok();
            expect(saveDiffOnly.getCall(0).args[0]).to.eql(testObj);
            expect(saveDiffOnly.getCall(0).args[1]).to.eql(creator);
            expect(saveDiffOnly.getCall(0).args[2]).to.eql(timestamp);
            expect(saveSnapAndDiff.called).not.to.be.ok();
            expect(saveSnapOnly.called).not.to.be.ok();
            expect(savedEntry.diff instanceof Diff).to.be.ok();
            expect(savedEntry.diff).to.eql(new Diff(testObj, entity, creator, timestamp, '1234567890'));
            expect(savedEntry.snapshot).not.to.be.ok();
        });
        it('should use correct method saveSnapshot of appservice when configured', () => {
            chrobject.config = Configuration.SNAP_ONLY;
            let savedEntry: { snapshot?: Snapshot, diff?: Diff } = chrobject.saveEntry(testObj, creator, timestamp);
            expect(saveSnapOnly.calledOnce).to.be.ok();
            expect(saveSnapOnly.getCall(0).args[0]).to.eql(testObj);
            expect(saveSnapOnly.getCall(0).args[1]).to.eql(creator);
            expect(saveSnapOnly.getCall(0).args[2]).to.eql(timestamp);
            expect(saveSnapAndDiff.called).not.to.be.ok();
            expect(saveDiffOnly.called).not.to.be.ok();
            expect(savedEntry.snapshot instanceof Snapshot).to.be.ok();
            expect(savedEntry.snapshot).to.eql(new Snapshot(testObj, entity, creator, timestamp, '0123456789'));
            expect(savedEntry.diff).not.to.be.ok();
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
