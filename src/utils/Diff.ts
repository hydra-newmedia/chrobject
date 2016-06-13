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
import { Creator } from  './Creator';

export class Diff implements Entry {
    id: string;
    entity: Entity;
    creator: Creator;
    obj: Object | Object[];
    objId: string;
    timestamp: Date;
    linkId: string;

    constructor(obj: Object, entity: Entity, creator: Creator, timestamp: Date, id?: string, linkId?: string) {
        this.entity = entity;
        this.creator = creator;
        this.obj = obj;
        this.objId = _.get<string>(obj, this.entity.idPath);
        this.timestamp = timestamp;
        if (id) {
            this.id = id;
        }
        if (linkId) {
            this.linkId = linkId;
        }
    }

    setId(id: string): Diff {
        this.id = id;
        return this;
    }

    linkToId(linkId: string): Diff {
        this.linkId = linkId;
        return this;
    }

    clone(): Diff {
        return new Diff(this.obj, this.entity, this.creator, this.timestamp, this.id ? this.id : null, this.linkId ? this.linkId : null);
    }
}
