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
import * as _ from 'lodash';
import { EntrySchema } from './EntrySchema';
import { Entry } from '../../../utils/Entry';
import { ObjectId } from 'mongoose';

export class EntryModel implements IModel<EntryDocument> {
    _id: ObjectId | string;
    __v: number;
    metadata: {
        creator: {
            user: string,
            source: string
        },
        timestamp: string,
        objId: string
    };
    obj: Object | Object[];

    constructor(entry: Entry, objId?: string) {
        this.metadata = this.calcMetadata(entry, objId);
        this.obj = entry.obj;
    }

    private calcMetadata(entry: Entry, objId?: string): { creator: { user: string, source: string }, timestamp: Date, objId: string } {
        let objectId: string = objId ? objId : _.get<string>(entry.obj, entry.entity.idPath);
        return {
            creator: {
                user: entry.creator.user,
                source: entry.creator.source
            },
            timestamp: entry.timestamp.toISOString(),
            objId: objectId
        };
    }
}

export interface EntryDocument extends mongoose.Document, EntryModel {
}

let schema = new EntrySchema();

export var EntryCollection = mongoose.model<EntryDocument>(schema.getName().toString(), schema.getSchema());
