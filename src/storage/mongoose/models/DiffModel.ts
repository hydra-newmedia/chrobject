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
import { DiffSchema } from './DiffSchema';
import { Diff } from '../../../utils';
import { EntryModel } from './EntryModel';

export class DiffModel extends EntryModel implements IModel<DiffDocument> {
    constructor(diff: Diff) {
        super(diff);
    }
}

export interface DiffDocument extends mongoose.Document, DiffModel {
}

let schema = new DiffSchema();

export var DiffCollection = mongoose.model<DiffDocument>(schema.getName().toString(), schema.getSchema());
