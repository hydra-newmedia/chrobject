/**
 *  Creator: Christian Hotz
 *  Company: hydra newmedia GmbH
 *  Date: 20.06.16
 *
 *  Copyright hydra newmedia GmbH
 */

/**
 *  Imports
 */
import * as sinon from 'sinon';
import { EntryModel } from '../../../../../lib/storage/mongoose/models/EntryModel';
import { Entry } from '../../../../../lib/utils/Entry';
import { Entity } from '../../../../../lib/utils/Entity';
import { Creator } from '../../../../../lib/utils/Creator';

let expect = require('expect.js');

describe('The EntryModel\'s', () => {
    let entry: Entry = {
        id: '012345678901234567890123',
        entity: new Entity('testObj', 'a.identificator'),
        creator: new Creator('username', 'sourceapp'),
        obj: { a: { identificator: 'MYID' } },
        objId: '123456789012345678901234',
        timestamp: new Date('Dec 12 2010'),
        setId: (id: string): Entry => {
            this.id = id;
            return this;
        },
        clone: (): Entry => {
            return this;
        }
    };
    describe('constructor', () => {
        let calcMetadata: sinon.SinonStub;
        before('mock calcMetadata method', () => {
            calcMetadata = sinon.stub(EntryModel.prototype, 'calcMetadata', (entry: Entry) => {
                    return {
                        creator: {
                            user: entry.creator.user,
                            source: entry.creator.source
                        },
                        timestamp: entry.timestamp.toISOString(),
                        objId: entry.objId
                    };
                }
            );
        });
        beforeEach('reset mock', () => {
            calcMetadata.reset();
        });
        after('restore mock', () => {
            calcMetadata.restore();
        });

        it('should instantiate object properly', () => {
            let entryModel: EntryModel = new EntryModel(entry);
            expect(entryModel).to.be.ok();
            expect(entryModel).to.be.an('object');
            expect(entryModel instanceof EntryModel).to.be.ok();
        });
        it('should set members properly and call calcMetadata', () => {
            let entryModel: EntryModel = new EntryModel(entry);
            expect(calcMetadata.calledOnce).to.be.ok();
            expect(entryModel.metadata).to.be.ok();
            expect(entryModel.metadata).to.eql(calcMetadata(entry));
            expect(entryModel.obj).to.be.ok();
            expect(entryModel.obj).to.eql(entry.obj);
        });
    });

    describe('calcMetadata method', () => {
        let entryModel: EntryModel = new EntryModel(entry);
        it('should return metadata object', () => {
            let result = entryModel.calcMetadata(entry);
            expect(result).to.be.ok();
            expect(result).to.be.an('object');
            expect(result).to.eql({
                creator: {
                    user: entry.creator.user,
                    source: entry.creator.source
                },
                timestamp: entry.timestamp.toISOString(),
                objId: entry.objId,
                entity: entry.entity.name
            });
        });
        it('should calc objId from object if not provided via parameters', () => {
            let result = entryModel.calcMetadata(entry);
            expect(result).to.be.ok();
            expect(result).to.be.an('object');
            expect(result).to.eql({
                creator: {
                    user: entry.creator.user,
                    source: entry.creator.source
                },
                timestamp: entry.timestamp.toISOString(),
                objId: '123456789012345678901234',
                entity: entry.entity.name
            });
        });
    });
});
