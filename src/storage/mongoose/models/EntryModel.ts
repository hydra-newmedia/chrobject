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
import * as _ from 'lodash';
import * as mongoose from 'mongoose';
import { IModel } from 'mongoose-repo';
import { Entry } from '../../../utils/Entry';
import { Types } from 'mongoose';
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
        objId: string
    };
    obj: Object | IDeepDiff[];

    constructor(entry: Entry, objId?: string) {
        this.metadata = this.calcMetadata(entry, objId);
        this.obj = entry.obj;
    }

    calcMetadata(entry: Entry, objId?: string): { creator: { user: string, source: string }, timestamp: string, objId: string } {
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
