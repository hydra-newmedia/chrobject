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
import * as _ from 'lodash';
import * as sinon from 'sinon';
import { DeepDiff } from '../../../lib/utils/DeepDiff';
import { ArrayDiff } from '../../../lib/utils/ArrayDiff';

let expect = require('expect.js');

describe('The DeepDiff\'s', () => {
    describe('constructor', () => {
        let setArrayDiffs: sinon.SinonStub;
        let testArrayDiffs: ArrayDiff[] = [new ArrayDiff('added', 1, 'a'), new ArrayDiff('moved', 2, 'b', 3)];
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
        it('should NOT ignore 0 values (due to them not being truthy)', () => {
            let deepDiff: DeepDiff = new DeepDiff('edited', 'a.b', 0, 0);
            expect(deepDiff.oldValue).to.be(0);
            expect(deepDiff.newValue).to.be(0);
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

    describe('setArrayDiffs method', () => {
        let testArray: any[] = 'abcdefghij'.split('');
        it('should detect additions properly', () => {
            let deepDiff: DeepDiff = new DeepDiff('array', 'a.b', testArray, '0ab1cd2e34fghi5j6'.split(''));
            expect(_.filter(deepDiff.arrayDiffs, ['action', 'added'])).to.eql([
                new ArrayDiff('added', 0, '0'),
                new ArrayDiff('added', 3, '1'),
                new ArrayDiff('added', 6, '2'),
                new ArrayDiff('added', 8, '3'),
                new ArrayDiff('added', 9, '4'),
                new ArrayDiff('added', 14, '5'),
                new ArrayDiff('added', 16, '6')
            ]);
        });
        it('should detect removals properly', () => {
            let deepDiff: DeepDiff = new DeepDiff('array', 'a.b', testArray, 'bcegi'.split(''));
            expect(_.filter(deepDiff.arrayDiffs, ['action', 'removed'])).to.eql([
                new ArrayDiff('removed', 0, 'a'),
                new ArrayDiff('removed', 3, 'd'),
                new ArrayDiff('removed', 5, 'f'),
                new ArrayDiff('removed', 7, 'h'),
                new ArrayDiff('removed', 9, 'j')
            ]);
        });
        it('should detect movements properly', () => {
            let deepDiff: DeepDiff = new DeepDiff('array', 'a.b', testArray, 'bijahgdecf'.split(''));
            expect(_.filter(deepDiff.arrayDiffs, ['action', 'moved'])).to.eql([
                new ArrayDiff('moved', 0, 'a', 3),
                new ArrayDiff('moved', 1, 'b', 0),
                new ArrayDiff('moved', 2, 'c', 8),
                new ArrayDiff('moved', 3, 'd', 6),
                new ArrayDiff('moved', 4, 'e', 7),
                new ArrayDiff('moved', 5, 'f', 9),
                new ArrayDiff('moved', 6, 'g', 5),
                new ArrayDiff('moved', 7, 'h', 4),
                new ArrayDiff('moved', 8, 'i', 1),
                new ArrayDiff('moved', 9, 'j', 2)
            ]);
        });
        it('should detect all changes properly', () => {
            let deepDiff: DeepDiff = new DeepDiff('array', 'a.b', testArray, '0bij1g1dc2f3'.split(''));
            expect(deepDiff.arrayDiffs).to.eql([
                new ArrayDiff('removed', 0, 'a'),
                new ArrayDiff('moved', 2, 'c', 8),
                new ArrayDiff('moved', 3, 'd', 7),
                new ArrayDiff('removed', 4, 'e'),
                new ArrayDiff('moved', 5, 'f', 10),
                new ArrayDiff('moved', 6, 'g', 5),
                new ArrayDiff('removed', 7, 'h'),
                new ArrayDiff('moved', 8, 'i', 2),
                new ArrayDiff('moved', 9, 'j', 3),
                new ArrayDiff('added', 0, '0'),
                new ArrayDiff('added', 4, '1'),
                new ArrayDiff('added', 6, '1'),
                new ArrayDiff('added', 9, '2'),
                new ArrayDiff('added', 11, '3'),
            ]);
        });
    });
});
