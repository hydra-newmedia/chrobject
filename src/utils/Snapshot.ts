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
import { Entry } from './Entry';
import { Entity } from './Entity';
import { Creator } from './Creator';

export class Snapshot implements Entry {
    id: string;
    entity: Entity;
    creator: Creator;
    obj: Object;
    objId: string;
    timestamp: Date;

    constructor(obj: Object, entity: Entity, creator: Creator, timestamp: Date, id?: string) {
        this.entity = entity;
        this.creator = creator;
        this.obj = obj;
        this.objId = _.get<string>(obj, this.entity.idPath);
        this.timestamp = timestamp;
        if (id) {
            this.id = id;
        }
    }

    setId(id: string): Snapshot {
        this.id = id;
        return this;
    }

    clone(): Snapshot {
        return new Snapshot(this.obj, this.entity, this.creator, this.timestamp, this.id ? this.id : null);
    }
}
