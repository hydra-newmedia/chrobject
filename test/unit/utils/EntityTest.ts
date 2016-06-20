/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 16.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import { Entity } from '../../../lib';

let expect = require('expect.js');

describe('The Entity\'s', () => {
    describe('constructor', () => {
        it('should instantiate object properly', () => {
            let entity: Entity = new Entity('testObj', 'a.id');
            expect(entity).to.be.ok();
            expect(entity).to.be.an('object');
            expect(entity instanceof Entity).to.be.ok();
        });
        it('should set members properly', () => {
            let entity: Entity = new Entity('testObj', 'a.id');
            expect(entity.name).to.be.ok();
            expect(entity.name).to.be('testObj');
            expect(entity.idPath).to.be.ok();
            expect(entity.idPath).to.be('a.id');
        });
    });

    describe('equals method', () => {
        let entity1: Entity = new Entity('a', 'b');
        let entity2: Entity = new Entity('a', 'b');
        let entity3: Entity = new Entity('name', 'b');
        let entity4: Entity = new Entity('a', 'idPath');
        it('should return true if the same object is compared', () => {
            let result: boolean = entity1.equals(entity1);
            expect(result).to.be.a('boolean');
            expect(result).to.be.ok();
        });
        it('should return true if two entities have the same properties', () => {
            let result: boolean = entity1.equals(entity2);
            expect(result).to.be.a('boolean');
            expect(result).to.be.ok();
        });
        it('should return false if two entities have differing names', () => {
            let result: boolean = entity1.equals(entity3);
            expect(result).to.be.a('boolean');
            expect(result).not.to.be.ok();
        });
        it('should return false if two entities have differing idPaths', () => {
            let result: boolean = entity1.equals(entity4);
            expect(result).to.be.a('boolean');
            expect(result).not.to.be.ok();
        });
    });
});
