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
        it('should set members properly', () => {
            let arrayDiff: ArrayDiff = new ArrayDiff('added', 3, 'asdf');
            expect(arrayDiff.action).to.be.ok();
            expect(arrayDiff.action).to.be('added');
            expect(arrayDiff.added).to.be.ok();
            expect(arrayDiff.added).to.be(true);
            expect(arrayDiff.removed).not.to.be.ok();
            expect(arrayDiff.index).to.be.ok();
            expect(arrayDiff.index).to.be(3);
            expect(arrayDiff.value).to.be.ok();
            expect(arrayDiff.value).to.be('asdf');
        });
    });
});
