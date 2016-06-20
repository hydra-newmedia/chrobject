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
import { ArrayDiff } from '../../../lib/utils/ArrayDiff';

let expect = require('expect.js');

describe('The ArrayDiff\'s', () => {
    describe('constructor', () => {
        it('should instantiate object properly', () => {
            let arrayDiff: ArrayDiff = new ArrayDiff('added', 3, 'asdf');
            expect(arrayDiff).to.be.ok();
            expect(arrayDiff).to.be.an('object');
            expect(arrayDiff instanceof ArrayDiff).to.be.ok();
        });
        it('should set members properly (\'added\' case)', () => {
            let arrayDiff: ArrayDiff = new ArrayDiff('added', 3, 'asdf');
            expect(arrayDiff.action).to.be.ok();
            expect(arrayDiff.action).to.be('added');
            expect(arrayDiff.added).to.be.ok();
            expect(arrayDiff.added).to.be(true);
            expect(arrayDiff.moved).not.to.be.ok();
            expect(arrayDiff.removed).not.to.be.ok();
            expect(arrayDiff.oldIndex).not.to.be.ok();
            expect(arrayDiff.index).to.be.ok();
            expect(arrayDiff.index).to.be(3);
            expect(arrayDiff.newIndex).not.to.be.ok();
            expect(arrayDiff.value).to.be.ok();
            expect(arrayDiff.value).to.be('asdf');
        });
        it('should set members properly (\'moved\' case)', () => {
            let arrayDiff: ArrayDiff = new ArrayDiff('moved', 3, 'asdf', 4);
            expect(arrayDiff.action).to.be.ok();
            expect(arrayDiff.action).to.be('moved');
            expect(arrayDiff.added).not.to.be.ok();
            expect(arrayDiff.moved).to.be.ok();
            expect(arrayDiff.moved).to.be(true);
            expect(arrayDiff.removed).not.to.be.ok();
            expect(arrayDiff.oldIndex).to.be.ok();
            expect(arrayDiff.oldIndex).to.be(3);
            expect(arrayDiff.index).not.to.be.ok();
            expect(arrayDiff.newIndex).to.be.ok();
            expect(arrayDiff.newIndex).to.be(4);
            expect(arrayDiff.value).to.be.ok();
            expect(arrayDiff.value).to.be('asdf');
        });
        it('should set members properly (\'removed\' case)', () => {
            let arrayDiff: ArrayDiff = new ArrayDiff('removed', 3, 'asdf');
            expect(arrayDiff.action).to.be.ok();
            expect(arrayDiff.action).to.be('removed');
            expect(arrayDiff.added).not.to.be.ok();
            expect(arrayDiff.moved).not.to.be.ok();
            expect(arrayDiff.removed).to.be.ok();
            expect(arrayDiff.removed).to.be(true);
            expect(arrayDiff.oldIndex).not.to.be.ok();
            expect(arrayDiff.index).to.be.ok();
            expect(arrayDiff.index).to.be(3);
            expect(arrayDiff.newIndex).not.to.be.ok();
            expect(arrayDiff.value).to.be.ok();
            expect(arrayDiff.value).to.be('asdf');
        });
        it('should ignore fourth parameter in \'removed\' case', () => {
            let arrayDiff: ArrayDiff = new ArrayDiff('removed', 3, 'asdf', 4);
            expect(arrayDiff.action).to.be.ok();
            expect(arrayDiff.action).to.be('removed');
            expect(arrayDiff.oldIndex).not.to.be.ok();
            expect(arrayDiff.index).to.be.ok();
            expect(arrayDiff.index).to.be(3);
            expect(arrayDiff.newIndex).not.to.be.ok();
        });
        it('should ignore fourth parameter in \'added\' case', () => {
            let arrayDiff: ArrayDiff = new ArrayDiff('added', 3, 'asdf', 4);
            expect(arrayDiff.action).to.be.ok();
            expect(arrayDiff.action).to.be('added');
            expect(arrayDiff.oldIndex).not.to.be.ok();
            expect(arrayDiff.index).to.be.ok();
            expect(arrayDiff.index).to.be(3);
            expect(arrayDiff.newIndex).not.to.be.ok();
        });
    });
});
