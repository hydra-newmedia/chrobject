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
import { Creator } from  './Creator';

export class Diff extends Entry {
    linkId: string;

    constructor(obj: Object, entity: Entity, creator: Creator, timestamp: Date, id?: string, linkId?: string) {
        if (id) {
            super(obj, entity, creator, timestamp, id);
        } else {
            super(obj, entity, creator, timestamp)
        }
        if (linkId) {
            this.linkId = linkId;
        }
    }

    linkToId(linkId: string) {
        this.linkId = linkId;
    }
}
