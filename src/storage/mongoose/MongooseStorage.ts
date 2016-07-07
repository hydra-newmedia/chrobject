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
import { Repository } from 'mongoose-repo';
import { LoggerConfig } from 'be-utils';
import { StorageStrategy } from '../StorageStrategy';
import { Snapshot } from '../../utils/Snapshot';
import { IDeepDiff } from '../../utils/IDeepDiff';
import { Diff } from '../../utils/Diff';
import { Entity } from '../../utils/Entity';
import { Creator } from '../../utils/Creator';
import { DiffDocument, DiffCollection, DiffModel } from './models/DiffModel';
import {
    SnapshotDocument,
    SnapshotCollection,
    SnapshotModel
} from './models/SnapshotModel';
import { LoggerInstance } from 'winston';

export class MongooseStorage implements StorageStrategy {

    snapshotRepository: Repository<SnapshotDocument>;
    diffRepository: Repository<DiffDocument>;

    constructor(loggerOrCfg: LoggerInstance | LoggerConfig, dbConnectionString?: string, dbOptions?: mongoose.ConnectionOptions) {
        if (!mongoose.connection.readyState && dbConnectionString) {
            mongoose.connect(dbConnectionString, dbOptions ? dbOptions : null);
        }
        this.snapshotRepository = new Repository<SnapshotDocument>(SnapshotCollection, loggerOrCfg);
        this.diffRepository = new Repository<DiffDocument>(DiffCollection, loggerOrCfg);
    }

    findSnapshotById(id: string, callback: (err: Error, snapshot?: Snapshot) => void) {
        this.snapshotRepository.findById(id, (err: any, model?: SnapshotDocument) => {
            if (err) {
                callback(err);
            } else {
                let snap: Snapshot = new Snapshot(
                    model.obj,
                    new Entity(model.metadata.entity, undefined),
                    new Creator(model.metadata.creator.user, model.metadata.creator.source),
                    new Date(model.metadata.timestamp),
                    model._id.toHexString()
                );
                callback(null, snap.setObjId(model.metadata.objId));
            }
        });
    }

    insertSnapshot(snapshot: Snapshot, callback: (err: Error, snapshot?: Snapshot) => void) {
        this.snapshotRepository.insert(new SnapshotModel(snapshot), (err: any, model?: SnapshotDocument) => {
            if (err || !model) {
                callback(err);
            } else {
                callback(null, snapshot.clone().setId(model._id.toString()));
            }
        });
    }

    upsertSnapshot(snapshot: Snapshot, callback: (err: Error, snapshot?: Snapshot) => void) {
        let updateCondition = { 'metadata.entity': snapshot.entity.name, 'metadata.objId': snapshot.objId };
        this.snapshotRepository.updateByCondition(updateCondition, new SnapshotModel(snapshot),
            (err: any, model?: SnapshotDocument) => {
                if (err || !model) {
                    callback(err);
                } else {
                    callback(null, snapshot.clone().setId(model._id.toString()));
                }
            }
        );
    }

    insertDiff(diff: Diff, callback: (err: Error, diff?: Diff) => void) {
        this.diffRepository.insert(new DiffModel(diff), (err: any, model?: DiffDocument) => {
                if (err || !model) {
                    callback(err);
                } else {
                    callback(null, diff.clone().setId(model._id.toString()));
                }
            }
        );
    }

    findLatestSnapshotBefore(id: string, timestamp: Date, entity: Entity, callback: (err: Error, snapshot?: Snapshot) => void) {
        let searchCondition = { 'metadata.entity': entity.name, 'metadata.objId': id };
        SnapshotCollection.findOne(searchCondition).sort({ 'metadata.timestamp': -1 })
            .exec((err: any, model?: SnapshotDocument) => {
                if (err || !model) {
                    callback(err);
                } else {
                    let creator: Creator = new Creator(model.metadata.creator.user, model.metadata.creator.source);
                    let timestamp: Date = new Date(Date.parse(model.metadata.timestamp));
                    callback(null, new Snapshot(model.obj, entity, creator, timestamp, model._id.toString()));
                }
            });
    }

    findLatestDiffBefore(id: string, timestamp: Date, entity: Entity, callback: (err: Error, diff?: Diff) => void) {
        let searchCondition = { 'metadata.entity': entity.name, 'metadata.objId': id };
        DiffCollection.findOne(searchCondition).sort({ 'metadata.timestamp': -1 })
            .exec((err: any, model?: DiffDocument) => {
                if (err || !model) {
                    callback(err);
                } else {
                    let creator = new Creator(model.metadata.creator.user, model.metadata.creator.source);
                    let timestamp: Date = new Date(Date.parse(model.metadata.timestamp));
                    callback(null, new Diff(<IDeepDiff[]> model.obj, id, entity, creator, timestamp, model._id.toString()));
                }
            });
    }

}
