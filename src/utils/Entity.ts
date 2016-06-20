/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 11.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

export class Entity {
    name: string;
    idPath: string;

    constructor(name: string, idPath: string) {
        this.name = name;
        this.idPath = idPath;
    }

    equals(other: Entity): boolean {
        return this.name === other.name && this.idPath === other.idPath;
    }
}
