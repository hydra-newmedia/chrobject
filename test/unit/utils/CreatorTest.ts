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
import { Creator } from '../../../lib/utils/Creator';
let expect = require('expect.js');

describe('The Creator\'s', () => {
    describe('constructor', () => {
        it('should instantiate object properly', () => {
            let creator: Creator = new Creator('user', 'source');
            expect(creator).to.be.ok();
            expect(creator).to.be.an('object');
            expect(creator instanceof Creator).to.be.ok();
        });
        it('should set members properly', () => {
            let creator: Creator = new Creator('user', 'source');
            expect(creator.user).to.ok();
            expect(creator.user).to.be('user');
            expect(creator.source).to.be.ok();
            expect(creator.source).to.be('source');
        });
    });
});
