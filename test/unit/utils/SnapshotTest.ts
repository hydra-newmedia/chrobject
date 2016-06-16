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
import { Snapshot, Entity, Creator } from '../../../lib';

let expect = require('expect.js');

describe('The Snapshot\'s', () => {
    let testObj: Object = { a: { id: 'asdf' }, b: { c: 'ö' }};
    let entity: Entity = new Entity('testObj', 'a.id');
    let creator: Creator = new Creator('username', 'sourceapp');
    let timestamp: Date = new Date();
    describe('constructor', () => {
        it('should instantiate object properly', () => {
            let snap: Snapshot = new Snapshot(testObj, entity, creator, timestamp);
            expect(snap).to.be.ok();
            expect(snap).to.be.an('object');
            expect(snap instanceof Snapshot).to.be.ok();
        });
        it('should set members properly', () => {
            let snap: Snapshot = new Snapshot(testObj, entity, creator, timestamp);
            expect(snap.id).not.to.be.ok();
            expect(snap.obj).to.be.ok();
            expect(snap.obj).to.equal(testObj);
            expect(snap.objId).to.be.ok();
            expect(snap.objId).to.be('asdf');
            expect(snap.entity).to.be.ok();
            expect(snap.entity).to.equal(entity);
            expect(snap.creator).to.be.ok();
            expect(snap.creator).to.equal(creator);
            expect(snap.timestamp).to.be.ok();
            expect(snap.timestamp).to.equal(timestamp);
        });
        it('should set members (including id) properly', () => {
            let snap: Snapshot = new Snapshot(testObj, entity, creator, timestamp, 'aaaa');
            expect(snap.id).to.be.ok();
            expect(snap.id).to.be('aaaa');
            expect(snap.obj).to.be.ok();
            expect(snap.obj).to.equal(testObj);
            expect(snap.objId).to.be.ok();
            expect(snap.objId).to.be('asdf');
            expect(snap.entity).to.be.ok();
            expect(snap.entity).to.equal(entity);
            expect(snap.creator).to.be.ok();
            expect(snap.creator).to.equal(creator);
            expect(snap.timestamp).to.be.ok();
            expect(snap.timestamp).to.equal(timestamp);
        });
    });

    describe('setId method', () => {
        it('should set id properly', () => {
            let snap: Snapshot = new Snapshot(testObj, entity, creator, timestamp);
            snap.setId('cccc');
            expect(snap.id).to.be.ok();
            expect(snap.id).to.be('cccc');
        });
        it('should overwrite id properly', () => {
            let snap: Snapshot = new Snapshot(testObj, entity, creator, timestamp, 'aaaa');
            expect(snap.id).to.be.ok();
            expect(snap.id).to.be('aaaa');
            snap.setId('cccc');
            expect(snap.id).to.be.ok();
            expect(snap.id).to.be('cccc');
        });
        it('should return the Snapshot\'s instance', () => {
            let snap: Snapshot = new Snapshot(testObj, entity, creator, timestamp, 'aaaa');
            let settedSnap: Snapshot = snap.setId('cccc');
            expect(snap).to.equal(settedSnap);
            expect(snap.id).to.equal(settedSnap.id);
        });
    });

    describe('clone method', () => {
        it('should return a similar Snapshot', () => {
            let snap: Snapshot = new Snapshot(testObj, entity, creator, timestamp, 'bbbb');
            let clone: Snapshot = snap.clone();
            expect(clone).to.eql(snap);
            expect(clone).not.to.equal(snap);
        });
    });
});
