/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 20.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import { DiffSchema } from '../../../../../lib/storage/mongoose/models/DiffSchema';
import { Schema } from 'mongoose';

let expect = require('expect.js');

describe('The DiffSchema\'s', () => {
    describe('constructor', () => {
        it('should instantiate object properly', () => {
            let diffSchema: DiffSchema = new DiffSchema();
            expect(diffSchema).to.be.ok();
            expect(diffSchema).to.be.an('object');
            expect(diffSchema instanceof DiffSchema).to.be.ok();
        });
        it('should set members properly (getters test included)', () => {
            let diffSchema: DiffSchema = new DiffSchema();
            expect(diffSchema.getName()).to.be.ok();
            expect(diffSchema.getName()).to.be('ChrobjectDiff');
            expect(diffSchema.getSchema()).to.be.ok();
            expect(JSON.stringify(diffSchema.getSchema())).to.eql(JSON.stringify(new Schema({
                metadata: {
                    creator: {
                        user: String,
                        source: String
                    },
                    timestamp: Date,
                    objId: String,
                    entity: String
                },
                obj: []
            })));
        });
    });
});
