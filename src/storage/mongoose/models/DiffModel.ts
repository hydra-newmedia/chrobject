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
import * as _ from 'lodash';
import { IModel } from 'mongoose-repo';
import { DiffSchema } from './DiffSchema';
import { Diff } from '../../../utils/Diff';
import { EntryModel } from './EntryModel';
import { Model } from 'mongoose';

export class DiffModel extends EntryModel implements IModel<DiffDocument> {
    constructor(diff: Diff) {
        super(diff);
        if (diff.linkId) {
            _.set(this.metadata, 'linkId', diff.linkId);
        }
    }
}

export interface DiffDocument extends mongoose.Document, DiffModel {
}

let schema = new DiffSchema();

export var DiffCollection: Model<DiffDocument> = mongoose.model<DiffDocument>(schema.getName(), schema.getSchema());
