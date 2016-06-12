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
import { IModel } from 'mongoose-repo';
import { EntrySchema } from './EntrySchema';
import { Entry } from '../../../utils';
import { ObjectId } from 'mongoose';

export class EntryModel implements IModel<EntryDocument> {
    _id: ObjectId | string;
    __v: number;
    metadata: {
        creator: {
            user: string,
            source: string
        },
        timestamp: string
    };
    obj: Object;

    constructor(entry: Entry) {
        this.metadata = this.calcMetadata(entry);
        this.obj = entry.obj;
    }

    private calcMetadata(entry: Entry): { creator: { user: string, source: string }, timestamp: Date } {
        return {
            creator: {
                user: entry.creator.user,
                source: entry.creator.source
            },
            timestamp: entry.timestamp.toISOString()
        };
    }
}

export interface EntryDocument extends mongoose.Document, EntryModel {
}

let schema = new EntrySchema();

export var EntryCollection = mongoose.model<EntryDocument>(schema.getName().toString(), schema.getSchema());
