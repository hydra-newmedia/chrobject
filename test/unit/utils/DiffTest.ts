/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 16.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import { Diff, Entity, Creator, IDeepDiff } from '../../../lib';
import { DeepDiff } from '../../../lib/utils/DeepDiff';

let expect = require('expect.js');

describe('The Diff\'s', () => {
    let deepDiffs: IDeepDiff[] = [new DeepDiff('edited', 'a.b', 'a', 'b')];
    let entity: Entity = new Entity('testObj', 'a.id');
    let creator: Creator = new Creator('username', 'sourceapp');
    let timestamp: Date = new Date();
    describe('constructor', () => {
        it('should instantiate object properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp);
            expect(diff).to.be.ok();
            expect(diff).to.be.an('object');
            expect(diff instanceof Diff).to.be.ok();
        });
        it('should set members properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp);
            expect(diff.id).not.to.be.ok();
            expect(diff.obj).to.be.ok();
            expect(diff.obj).to.eql(deepDiffs);
            expect(diff.objId).to.be.ok();
            expect(diff.objId).to.be('007');
            expect(diff.entity).to.be.ok();
            expect(diff.entity).to.eql(entity);
            expect(diff.creator).to.be.ok();
            expect(diff.creator).to.eql(creator);
            expect(diff.timestamp).to.be.ok();
            expect(diff.timestamp).to.eql(timestamp);
            expect(diff.linkId).not.to.be.ok();
        });
        it('should set members (including id) properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, 'aaaa');
            expect(diff.id).to.be.ok();
            expect(diff.id).to.be('aaaa');
            expect(diff.obj).to.be.ok();
            expect(diff.obj).to.eql(deepDiffs);
            expect(diff.objId).to.be.ok();
            expect(diff.objId).to.be('007');
            expect(diff.entity).to.be.ok();
            expect(diff.entity).to.eql(entity);
            expect(diff.creator).to.be.ok();
            expect(diff.creator).to.eql(creator);
            expect(diff.timestamp).to.be.ok();
            expect(diff.timestamp).to.eql(timestamp);
            expect(diff.linkId).not.to.be.ok();
        });
        it('should set members (including linkId) properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, null, 'bbbb');
            expect(diff.id).not.to.be.ok();
            expect(diff.obj).to.be.ok();
            expect(diff.obj).to.eql(deepDiffs);
            expect(diff.objId).to.be.ok();
            expect(diff.objId).to.be('007');
            expect(diff.entity).to.be.ok();
            expect(diff.entity).to.eql(entity);
            expect(diff.creator).to.be.ok();
            expect(diff.creator).to.eql(creator);
            expect(diff.timestamp).to.be.ok();
            expect(diff.timestamp).to.eql(timestamp);
            expect(diff.linkId).to.be.ok();
            expect(diff.linkId).to.be('bbbb');
        });
        it('should set members (including id and linkId) properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, 'aaaa', 'bbbb');
            expect(diff.id).to.be.ok();
            expect(diff.id).to.be('aaaa');
            expect(diff.obj).to.be.ok();
            expect(diff.obj).to.eql(deepDiffs);
            expect(diff.objId).to.be.ok();
            expect(diff.objId).to.be('007');
            expect(diff.entity).to.be.ok();
            expect(diff.entity).to.eql(entity);
            expect(diff.creator).to.be.ok();
            expect(diff.creator).to.eql(creator);
            expect(diff.timestamp).to.be.ok();
            expect(diff.timestamp).to.eql(timestamp);
            expect(diff.linkId).to.be.ok();
            expect(diff.linkId).to.be('bbbb');
        });
    });

    describe('setId method', () => {
        it('should set id properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp);
            diff.setId('cccc');
            expect(diff.id).to.be.ok();
            expect(diff.id).to.be('cccc');
        });
        it('should overwrite id properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, 'aaaa');
            expect(diff.id).to.be.ok();
            expect(diff.id).to.be('aaaa');
            diff.setId('cccc');
            expect(diff.id).to.be.ok();
            expect(diff.id).to.be('cccc');
        });
        it('should return the Diff\'s instance', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, 'aaaa');
            let settedDiff: Diff = diff.setId('cccc');
            expect(diff).to.equal(settedDiff);
            expect(diff.id).to.equal(settedDiff.id);
        });
    });

    describe('linkToId method', () => {
        it('should set linkId properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp);
            diff.linkToId('cccc');
            expect(diff.linkId).to.be.ok();
            expect(diff.linkId).to.be('cccc');
        });
        it('should overwrite linkId properly', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, null, 'aaaa');
            expect(diff.linkId).to.be.ok();
            expect(diff.linkId).to.be('aaaa');
            diff.linkToId('cccc');
            expect(diff.linkId).to.be.ok();
            expect(diff.linkId).to.be('cccc');
        });
        it('should return the Diff\'s instance', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, null, 'aaaa');
            let linkedDiff: Diff = diff.linkToId('cccc');
            expect(diff).to.equal(linkedDiff);
            expect(diff.linkId).to.equal(linkedDiff.linkId);
        });
    });

    describe('clone method', () => {
        it('should return a similar Diff', () => {
            let diff: Diff = new Diff(deepDiffs, '007', entity, creator, timestamp, null, 'bbbb');
            let clone: Diff = diff.clone();
            expect(clone).to.eql(diff);
            expect(clone).not.to.equal(diff);
        });
    });
});
