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
import { Entity } from './Entity';
import { Creator } from './Creator';

export interface Entry {
    id: string;
    entity: Entity;
    creator: Creator;
    obj: Object | Object[];
    objId: string;
    timestamp: Date;

    isEmpty(): boolean;
    
    setId(id: string): Entry;

    clone(): Entry;
}
