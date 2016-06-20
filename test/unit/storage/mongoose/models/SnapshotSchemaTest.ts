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
import { SnapshotSchema } from '../../../../../lib/storage/mongoose/models/SnapshotSchema';
import { Schema } from 'mongoose';

let expect = require('expect.js');

describe('The SnapshotSchema\'s', () => {
    describe('constructor', () => {
        it('should instantiate object properly', () => {
            let snapshotSchema: SnapshotSchema = new SnapshotSchema();
            expect(snapshotSchema).to.be.ok();
            expect(snapshotSchema).to.be.an('object');
            expect(snapshotSchema instanceof SnapshotSchema).to.be.ok();
        });
        it('should set members properly (getters test included)', () => {
            let snapshotSchema: SnapshotSchema = new SnapshotSchema();
            expect(snapshotSchema.getName()).to.be.ok();
            expect(snapshotSchema.getName()).to.be('ChrobjectSnapshot');
            expect(snapshotSchema.getSchema()).to.be.ok();
            expect(JSON.stringify(snapshotSchema.getSchema())).to.eql(JSON.stringify(new Schema({
                metadata: {
                    creator: {
                        user: String,
                        source: String
                    },
                    timestamp: Date,
                    objId: String
                },
                obj: {}
            })));
        });
    });
});
