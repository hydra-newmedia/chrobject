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

export class DiffSchema implements ISchema {

    private schema: Schema;
    private name: String;

    constructor() {
        this.name = 'Snapshot';
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

    getName(): String {
        return this.name;
    }

    getSchema(): Schema {
        return this.schema;
    }
}
