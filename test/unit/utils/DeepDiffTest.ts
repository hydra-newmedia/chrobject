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
import * as sinon from 'sinon';
import { DeepDiff } from '../../../lib/utils/DeepDiff';
import { ArrayDiff } from '../../../lib/utils/ArrayDiff';

let expect = require('expect.js');

describe('The DeepDiff\'s', () => {
    describe('constructor', () => {
        let setArrayDiffs: sinon.SinonStub;
        let testArrayDiffs: { additions: ArrayDiff[], removals: ArrayDiff[] } = {
            additions: [new ArrayDiff(1, 'c'), new ArrayDiff(2, 'd')],
            removals: [new ArrayDiff(1, 'a'), new ArrayDiff(2, 'b')]
        };
        before('mock setArrayDiffs', () => {
            setArrayDiffs = sinon.stub(DeepDiff.prototype, 'setArrayDiffs', function(one: any[], two: any[]) {
                this.arrayDiffs = testArrayDiffs;
            });
        });
        after('restore setArrayDiffs mock', () => {
            setArrayDiffs.restore();
        });
        beforeEach('reset setArrayDiffs mock', () => {
            setArrayDiffs.reset();
        });
        it('should instantiate object properly', () => {
            let deepDiff: DeepDiff = new DeepDiff('edited', 'a.b', 'aaa', 'bbb');
            expect(deepDiff).to.be.ok();
            expect(deepDiff).to.be.an('object');
            expect(deepDiff instanceof DeepDiff).to.be.ok();
        });
        it('should set members properly', () => {
            let deepDiff: DeepDiff = new DeepDiff('edited', 'a.b', 'aaa', 'bbb');
            expect(deepDiff.action).to.be.ok();
            expect(deepDiff.action).to.be('edited');
            expect(deepDiff.edited).to.be.ok();
            expect(deepDiff.edited).to.be(true);
            expect(deepDiff.created).not.to.be.ok();
            expect(deepDiff.deleted).not.to.be.ok();
            expect(deepDiff.array).not.to.be.ok();
            expect(deepDiff.propertyPath).to.be.ok();
            expect(deepDiff.propertyPath).to.be('a.b');
            expect(deepDiff.oldValue).to.be.ok();
            expect(deepDiff.oldValue).to.be('aaa');
            expect(deepDiff.newValue).to.be.ok();
            expect(deepDiff.newValue).to.be('bbb');
            expect(deepDiff.arrayDiffs).not.to.be.ok();
        });
        it('should set created if action=\'created\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('created', 'a.b', null, 'bbb');
            expect(deepDiff.action).to.be.ok();
            expect(deepDiff.action).to.be('created');
            expect(deepDiff.created).to.be.ok();
            expect(deepDiff.created).to.be(true);
            expect(deepDiff.edited).not.to.be.ok();
            expect(deepDiff.deleted).not.to.be.ok();
            expect(deepDiff.array).not.to.be.ok();
        });
        it('should ignore oldValue if action=\'created\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('created', 'a.b', 'aaa', 'bbb');
            expect(deepDiff.oldValue).not.to.be.ok();
            expect(deepDiff.newValue).to.be.ok();
            expect(deepDiff.newValue).to.be('bbb');
        });
        it('should set edited if action=\'edited\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('edited', 'a.b', 'aaa', 'bbb');
            expect(deepDiff.action).to.be.ok();
            expect(deepDiff.action).to.be('edited');
            expect(deepDiff.created).not.to.be.ok();
            expect(deepDiff.edited).to.be.ok();
            expect(deepDiff.edited).to.be(true);
            expect(deepDiff.deleted).not.to.be.ok();
            expect(deepDiff.array).not.to.be.ok();
        });
        it('should set both new and old value if action=\'edited\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('edited', 'a.b', 'aaa', 'bbb');
            expect(deepDiff.oldValue).to.be.ok();
            expect(deepDiff.oldValue).to.be('aaa');
            expect(deepDiff.newValue).to.be.ok();
            expect(deepDiff.newValue).to.be('bbb');
        });
        it('should set deleted if action=\'deleted\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('deleted', 'a.b', 'aaa', 'bbb');
            expect(deepDiff.action).to.be.ok();
            expect(deepDiff.action).to.be('deleted');
            expect(deepDiff.created).not.to.be.ok();
            expect(deepDiff.edited).not.to.be.ok();
            expect(deepDiff.deleted).to.be.ok();
            expect(deepDiff.deleted).to.be(true);
            expect(deepDiff.array).not.to.be.ok();
        });
        it('should ignore newValue if action=\'deleted\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('deleted', 'a.b', 'aaa', 'bbb');
            expect(deepDiff.oldValue).to.be.ok();
            expect(deepDiff.oldValue).to.be('aaa');
            expect(deepDiff.newValue).not.to.be.ok();
        });
        it('should set array if action=\'array\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('array', 'a.b', 'ab'.split(''), 'cd'.split(''));
            expect(deepDiff.action).to.be.ok();
            expect(deepDiff.action).to.be('array');
            expect(deepDiff.created).not.to.be.ok();
            expect(deepDiff.edited).not.to.be.ok();
            expect(deepDiff.deleted).not.to.be.ok();
            expect(deepDiff.array).to.be.ok();
            expect(deepDiff.array).to.be(true);
        });
        it('should set both new and old value if action=\'array\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('array', 'a.b', 'ab'.split(''), 'cd'.split(''));
            expect(deepDiff.oldValue).to.be.ok();
            expect(deepDiff.oldValue).to.eql('ab'.split(''));
            expect(deepDiff.newValue).to.be.ok();
            expect(deepDiff.newValue).to.eql('cd'.split(''));
        });
        it('should calc arrayDiffs if action=\'array\'', () => {
            let deepDiff: DeepDiff = new DeepDiff('array', 'a.b', 'ab'.split(''), 'cd'.split(''));
            expect(deepDiff.arrayDiffs).to.eql(testArrayDiffs);
            expect(setArrayDiffs.calledOnce).to.be.ok();
            expect(setArrayDiffs.getCall(0).args[0]).to.eql('ab'.split(''));
            expect(setArrayDiffs.getCall(0).args[1]).to.eql('cd'.split(''));
        });
    });

});
