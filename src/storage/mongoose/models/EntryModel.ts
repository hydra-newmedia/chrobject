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
import * as mongoose from 'mongoose';
import { Types } from 'mongoose';
import { IModel } from 'mongoose-repo';
import { Entry } from '../../../utils/Entry';
import { IDeepDiff } from '../../../utils/IDeepDiff';

export class EntryModel implements IModel<EntryDocument> {
    _id: Types.ObjectId;
    __v: number;
    metadata: {
        creator: {
            user: string,
            source: string
        },
        timestamp: string,
        objId: string,
        entity: string,
        linkId?: string
    };
    obj: Object | IDeepDiff[];

    constructor(entry: Entry) {
        this.metadata = this.calcMetadata(entry);
        this.obj = entry.obj;
    }

    calcMetadata(entry: Entry): { creator: { user: string, source: string }, timestamp: string, objId: string, entity: string } {
        return {
            creator: {
                user: entry.creator.user,
                source: entry.creator.source
            },
            timestamp: entry.timestamp.toISOString(),
            objId: entry.objId,
            entity: entry.entity.name
        };
    }
}

export interface EntryDocument extends mongoose.Document, EntryModel {
}
