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
import { Repository } from 'mongoose-repo';
import { StorageStrategy } from '../StorageStrategy';
import { Snapshot, Diff, Entity } from '../../utils';
import { DiffDocument, DiffCollection } from './models/DiffModel';
import { EntryModel, EntryDocument } from './models/EntryModel';
import { SnapshotDocument, SnapshotCollection } from './models/SnapshotModel';
import { Creator } from '../../../lib/utils/Creator';

export class MongooseStorage implements StorageStrategy {

    snapshotRepository: Repository;
    diffRepository: Repository;

    constructor() {
        this.snapshotRepository = new Repository<SnapshotDocument>(SnapshotCollection);
        this.diffRepository = new Repository<DiffDocument>(DiffCollection);
    }

    upsertSnapshot(snapshot: Snapshot): Snapshot {
        let updateCondition = {};
        _.set(updateCondition, snapshot.entity.idPath, snapshot.objId);
        this.snapshotRepository.updateByCondition(updateCondition, new EntryModel(snapshot),
            (err: any, model?: EntryDocument) => {
                if (err || !model) {
                    throw err;
                } else {
                    snapshot.setId(model._id.toString());
                    return snapshot;
                }
            }
        );
    }

    upsertDiff(diff: Diff): Diff {
        let updateCondition = {};
        _.set(updateCondition, diff.entity.idPath, diff.objId);
        this.diffRepository.updateByCondition(updateCondition, new EntryModel(diff),
            (err: any, model?: EntryDocument) => {
                if (err || !model) {
                    throw err;
                } else {
                    diff.setId(model._id.toString());
                    return diff;
                }
            }
        );
    }

    findLatestSnapshotBefore(id: string, timestamp: Date, entity: Entity): Snapshot {
        let searchCondition = {};
        _.set(searchCondition, entity.idPath, id);
        SnapshotCollection.findOne(searchCondition).sort({ 'metadata.timestamp': -1 })
            .exec((err: any, model?: SnapshotDocument) => {
                if (err || !model) {
                    throw err;
                } else {
                    let creator = new Creator(model.metadata.creator.user, model.metadata.creator.source);
                    let timestamp = Date.parse(model.metadata.timestamp);
                    return new Snapshot(model.obj, entity, creator, timestamp, model._id.toString());
                }
            });
    }

    findLatestDiffBefore(id: string, timestamp: Date, entity: Entity): Diff {
        let searchCondition = {};
        _.set(searchCondition, entity.idPath, id);
        DiffCollection.findOne(searchCondition).sort({ 'metadata.timestamp': -1 })
            .exec((err: any, model?: DiffDocument) => {
                if (err || !model) {
                    throw err;
                } else {
                    let creator = new Creator(model.metadata.creator.user, model.metadata.creator.source);
                    let timestamp = Date.parse(model.metadata.timestamp);
                    return new Diff(model.obj, entity, creator, timestamp, model._id.toString());
                }
            });
    }

}
