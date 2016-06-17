/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 12.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import { Schema } from 'mongoose';
import { ISchema } from 'mongoose-repo';

export class SnapshotSchema implements ISchema {

    private schema: Schema;
    private name: string;

    constructor() {
        this.name = 'ChrobjectSnapshot';
        this.schema = new Schema({
            metadata: {
                creator: {
                    user: String,
                    source: String
                },
                timestamp: Date
            },
            obj: {}
        });
    }

    getName(): string {
        return this.name;
    }

    getSchema(): Schema {
        return this.schema;
    }
}
