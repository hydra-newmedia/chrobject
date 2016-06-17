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
import { IModel } from 'mongoose-repo';
import { SnapshotSchema } from './SnapshotSchema';
import { Snapshot } from '../../../utils/Snapshot';
import { EntryModel } from './EntryModel';

export class SnapshotModel extends EntryModel implements IModel<SnapshotDocument> {
    constructor(snapshot: Snapshot) {
        super(snapshot);
    }
}

export interface SnapshotDocument extends mongoose.Document, SnapshotModel {
}

let schema = new SnapshotSchema();

export var SnapshotCollection = mongoose.model<SnapshotDocument>(schema.getName(), schema.getSchema());
