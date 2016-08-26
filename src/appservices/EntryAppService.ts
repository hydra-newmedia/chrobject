/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 11.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import * as _ from 'lodash';
import * as hash from 'object-hash';
import { Entity } from '../utils/Entity';
import { Snapshot } from '../utils/Snapshot';
import { Diff } from '../utils/Diff';
import { Creator } from '../utils/Creator';
import {
    StorageStrategy,
    FindDiffsCondition
} from '../storage/StorageStrategy';
import { IDeepDiff } from '../utils/IDeepDiff';
import { DeepDiff } from '../utils/DeepDiff';
import { EntryAppServiceOptions } from '../utils/EntryAppServiceOptions';

export class EntryAppService {
    entity: Entity;
    storage: StorageStrategy;
    options: EntryAppServiceOptions;

    constructor(entity: Entity, storage: StorageStrategy, options?: EntryAppServiceOptions) {
        this.entity = entity;
        this.storage = storage;
        this.options = options ? options : { ignoreProperties: [] };
    }

    getDiffs(condition: FindDiffsCondition, callback: (err: Error, diffs?: Diff[]) => void) {
        if (!condition) {
            condition = {};
        }
        this.storage.findDiffsByCondition(condition, this.entity, callback);
    }

    getSnapshotById(id: string, callback: (err: Error, snapshot?: Snapshot) => void) {
        this.storage.findSnapshotById(id, this.entity, callback);
    }

    saveSnapshotAndDiff(obj: Object, creator: Creator, timestamp: Date,
                        callback: (err: Error, result?: { snapshot?: Snapshot, diff?: Diff }) => void) {
        let id: string = _.get<string>(obj, this.entity.idPath);
        this.storage.findLatestSnapshotBefore(id, timestamp, this.entity, (err: Error, oldSnap: Snapshot) => {
            if (err) {
                return callback(err);
            }
            let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
            let diff: Diff;
            if (oldSnap) {
                diff = this.diff(oldSnap, newSnap);
            } else {
                let blankSnap: Snapshot = new Snapshot({}, this.entity, creator, timestamp);
                diff = this.diff(blankSnap.setObjId(newSnap.objId), newSnap);
            }
            if (!diff.isEmpty()) {
                this.storage.insertSnapshot(newSnap, (err: Error, newSnap: Snapshot) => {
                    if (err) {
                        return callback(err);
                    }
                    diff.linkToId(newSnap.id);
                    this.storage.insertDiff(diff, (err: Error, diff: Diff) => {
                        if (callback) {
                            callback(err, { snapshot: newSnap, diff: diff });
                        }
                    });
                });
            } else {
                callback(null, { snapshot: null, diff: null });
            }
        });
    }

    saveSnapshot(obj: Object, creator: Creator, timestamp: Date, callback: (err: Error, snapshot?: Snapshot) => void) {
        let id: string = _.get<string>(obj, this.entity.idPath);
        this.storage.findLatestSnapshotBefore(id, timestamp, this.entity, (err: Error, oldSnap: Snapshot) => {
            if (err) {
                return callback(err);
            }
            let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp);
            let diff: Diff;
            if (oldSnap) {
                diff = this.diff(oldSnap, newSnap);
            } else {
                let blankSnap: Snapshot = new Snapshot({}, this.entity, creator, timestamp);
                diff = this.diff(blankSnap.setObjId(newSnap.objId), newSnap);
            }
            if (!diff.isEmpty()) {
                this.storage.insertSnapshot(newSnap, callback);
            } else {
                callback(null, null);
            }
        });
    }

    saveDiff(obj: Object, creator: Creator, timestamp: Date, callback: (err: Error, diff?: Diff) => void) {
        let id: string = _.get<string>(obj, this.entity.idPath);
        this.storage.findLatestSnapshotBefore(id, timestamp, this.entity, (err: Error, oldSnap: Snapshot) => {
            if (err) {
                return callback(err);
            }
            let newSnap: Snapshot = new Snapshot(obj, this.entity, creator, timestamp, oldSnap ? oldSnap.id : undefined);
            let diff: Diff;
            if (oldSnap) {
                diff = this.diff(oldSnap, newSnap);
            } else {
                let blankSnap: Snapshot = new Snapshot({}, this.entity, creator, timestamp);
                diff = this.diff(blankSnap.setObjId(newSnap.objId), newSnap);
            }
            if (!diff.isEmpty()) {
                this.storage.upsertSnapshot(newSnap, (err: Error, newSnap: Snapshot) => {
                    if (err) {
                        return callback(err);
                    } else {
                        this.storage.insertDiff(diff, callback ? callback : undefined);
                    }
                });
            } else {
                callback(null, null);
            }
        });
    }

    diff(snapOne: Snapshot, snapTwo: Snapshot): Diff {
        // Check if snapshots are of same object
        if (snapOne.objId !== snapTwo.objId) {
            throw new Error('Diffed snapshots are not of same object');
        }
        // Check if snapshots are of same entity
        if (!snapOne.entity.equals(snapTwo.entity)) {
            throw new Error('Diffed snapshots are not of same entity');
        }
        // swap snapshots if snapTwo was taken before snapOne
        if (snapOne.timestamp > snapTwo.timestamp) {
            let tmp = snapOne;
            snapOne = snapTwo;
            snapTwo = tmp;
        }

        // diff between the two snapshots
        let diffObj: IDeepDiff[] = this.deepDiff(snapOne.obj, snapTwo.obj);

        return new Diff(diffObj, snapTwo.objId, snapTwo.entity, snapTwo.creator, snapTwo.timestamp);
    }

    deepDiff(one: Object, two: Object, path: string = ''): IDeepDiff[] {
        let result: IDeepDiff[] = [];
        for (var key of _.keys(one)) {
            let concatPath: string = path ? path + '.' + key : key;
            if (!_.includes(this.options.ignoreProperties, concatPath)) {

                let getDeletedProperties = (obj: any, propPath: string = null) => {
                    if (_.isPlainObject(obj)) {
                        for (var objKey of _.keys(obj)) {
                            getDeletedProperties(obj[objKey], propPath ? propPath + '.' + objKey : objKey);
                        }
                    } else if (_.isBoolean(obj) || _.isDate(obj) || _.isNumber(obj)
                        || _.isNull(obj) || _.isRegExp(obj) || _.isString(obj) || _.isArray(obj)) {
                        result.push(new DeepDiff('deleted', propPath, obj, null));
                    }
                };

                if (_.isPlainObject(one[key])) {
                    if (!_.has(two, key)) {
                        getDeletedProperties(one[key], concatPath);
                    } else {
                        result = _.concat(result, this.deepDiff(one[key], two[key], path ? path + '.' + key : key));
                    }
                } else if (_.isBoolean(one[key]) || _.isDate(one[key]) || _.isNumber(one[key])
                    || _.isNull(one[key]) || _.isRegExp(one[key]) || _.isString(one[key])) {
                    if (!_.has(two, key)) {
                        result.push(new DeepDiff('deleted', concatPath, one[key], null));
                    } else if (hash(one[key]) !== hash(two[key])) {
                        result.push(new DeepDiff('edited', concatPath, one[key], two[key]));
                    }
                } else if (_.isArray(one[key]) && _.isArray(two[key]) && !_.isEqual(one[key], two[key])) {
                    result.push(new DeepDiff('array', concatPath, one[key], two[key]));
                } else if (!_.has(two, key)) {
                    getDeletedProperties(one[key], concatPath);
                }
            }
        }

        let getCreatedProperties = (obj: Object, path: string = null) => {
            for (var key of _.keys(path ? _.get(obj, path) : obj)) {
                let concatPath: string = path ? path + '.' + key : key;
                let val: any = _.get(two, concatPath);
                if (!_.includes(this.options.ignoreProperties, concatPath)) {
                    if (_.isBoolean(val) || _.isDate(val) || _.isNumber(val)
                        || _.isNull(val) || _.isRegExp(val) || _.isString(val) || _.isArray(val)) {
                        if (!_.has(one, concatPath)) {
                            result.push(new DeepDiff('created', concatPath, null, val));
                        }
                    } else if (_.isPlainObject(val)) {
                        getCreatedProperties(obj, concatPath);
                    }
                }
            }
        };

        getCreatedProperties(two, path);

        return result;
    }
}
