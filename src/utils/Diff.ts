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
import { Entry } from './Entry';
import { Entity } from './Entity';
import { Creator } from './Creator';
import { IDeepDiff } from './IDeepDiff';

export class Diff implements Entry {
    id: string;
    entity: Entity;
    creator: Creator;
    obj: IDeepDiff[];
    objId: string;
    timestamp: Date;
    linkId: string;

    constructor(diff: IDeepDiff[], objId: string, entity: Entity, creator: Creator, timestamp: Date, id?: string, linkId?: string) {
        this.entity = entity;
        this.creator = creator;
        this.obj = diff;
        this.objId = objId;
        this.timestamp = timestamp;
        if (id) {
            this.id = id;
        }
        if (linkId) {
            this.linkId = linkId;
        }
    }

    isEmpty(): boolean {
        return this.obj.length === 0;
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
        return new Diff(this.obj, this.objId, this.entity, this.creator, this.timestamp,
            this.id ? this.id : null, this.linkId ? this.linkId : null);
    }
}
