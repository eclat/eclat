import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/typeorm';
import {
    Connection,
    EntityMetadata,
    EntitySubscriberInterface,
    ObjectLiteral,
    RemoveEvent,
    UpdateEvent
} from 'typeorm';

@Injectable()
export class TreeEntitiesBuilderSubscriber<T extends object = object> implements EntitySubscriberInterface {
    public constructor(@InjectConnection() connection: Connection) {
        connection.subscribers.push(this);
    }

    public async beforeUpdate(event: UpdateEvent<T>): Promise<void> {
        this.assertOnlyHandleMaterializedPathTreeType(event.metadata);

        if (event.metadata.treeType === 'materialized-path' && event.databaseEntity) {
            const { mPath, parentPath } = this.getPropertyPath(event.metadata);
            const updatedEntityId: string = this.getId(event.metadata, event.entity);
            const newParentEntity: T = event.metadata.treeParentRelation.getEntityValue(event.entity);
            const oldParentEntity: T = event.metadata.treeParentRelation.getEntityValue(event.databaseEntity);

            await event.manager.createQueryBuilder()
                .update(event.metadata.target)
                .where({
                    [parentPath]: event.entity
                })
                .set({
                    [parentPath]: oldParentEntity
                })
                .execute();

            await event.manager.createQueryBuilder()
                .update(event.metadata.target)
                .set({ [mPath]: () => `REPLACE(${mPath}, '${updatedEntityId}.', '')` })
                .where(`${mPath} LIKE CONCAT('%', :id::varchar, '%')`, { id: updatedEntityId })
                .andWhere(`${mPath} LIKE CONCAT('%', :newParentId::varchar, '%')`, { newParentId: this.getId(event.metadata, oldParentEntity) })
                .execute();

            const parentId: ObjectLiteral | undefined = event.metadata.getEntityIdMap(
                newParentEntity
            );
            const currentId: ObjectLiteral | undefined = event.metadata.getEntityIdMap(event.entity);

            let parentMPath: string = '';
            if (parentId) {
                parentMPath = await event.manager
                    .createQueryBuilder()
                    .select(mPath, 'path')
                    .from(event.metadata.target, event.metadata.targetName)
                    .whereInIds(parentId)
                    .getRawOne()
                    .then(result => result ? result['path'] : undefined);
            }

            const oldPath: string = await event.manager
                .createQueryBuilder()
                .select(mPath, 'path')
                .from(event.metadata.target, event.metadata.targetName)
                .whereInIds(currentId)
                .getRawOne()
                .then(result => result ? result['path'] : undefined);
            const newPath: string = `${parentMPath}${updatedEntityId}.`;

            if (oldPath !== newPath) {
                await event.manager
                    .createQueryBuilder()
                    .update(event.metadata.target)
                    .set({ [mPath]: () => `REPLACE(${mPath}, :oldPath, :newPath)` })
                    .where(`${mPath} LIKE CONCAT(:oldPath::varchar, '%')`)
                    .setParameter('oldPath', oldPath)
                    .setParameter('newPath', newPath)
                    .execute();
            }
        }
    }

    public async beforeRemove(event: RemoveEvent<T>): Promise<void> {
        this.assertOnlyHandleMaterializedPathTreeType(event.metadata);

        if (event.metadata.treeType === 'materialized-path') {
            const id: string = this.getId(event.metadata, event.entity);
            const { mPath, parentPath } = this.getPropertyPath(event.metadata);

            const parent: T | null = (
                await event.manager.getRepository(
                    event.metadata.target
                ).findOneOrFail(event.entityId, { relations: [parentPath] })
            )[parentPath];

            await event.manager.createQueryBuilder()
                .update(event.metadata.target)
                .where({
                    [parentPath]: event.entity
                })
                .set({
                    [parentPath]: parent
                })
                .execute();

            await event.manager.createQueryBuilder()
                .update(event.metadata.target)
                .set({ [mPath]: () => `REPLACE(${mPath}, '${id}.', '')` })
                .execute();
        }
    }

    protected assertOnlyHandleMaterializedPathTreeType(metadata: EntityMetadata): void {
        if (metadata.treeType && metadata.treeType !== 'materialized-path') {
            throw new Error('only materialized path tree type that supported');
        }
    }

    protected getId(metadata: EntityMetadata, entity: T): string {
        return metadata.treeParentRelation.joinColumns.map(jc => jc.referencedColumn.getEntityValue(entity)).join('_');
    }

    protected getPropertyPath(metadata: EntityMetadata): { parentPath: string; mPath: string } {
        const parentPath: string = metadata.treeParentRelation.propertyPath;
        const mPath: string = metadata.materializedPathColumn.propertyPath;

        return { parentPath, mPath };
    }
}
