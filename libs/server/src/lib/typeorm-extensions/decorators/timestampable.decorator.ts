import { getMetadataArgsStorage } from 'typeorm';

export function Timestampable(): ClassDecorator {
    return target => {
        getMetadataArgsStorage().columns.push(
            {
                target,
                propertyName: 'createdAt',
                mode: 'createDate',
                options: {
                    type: 'timestamptz',
                    nullable: true
                }
            },
            {
                target,
                propertyName: 'updatedAt',
                mode: 'updateDate',
                options: {
                    type: 'timestamptz',
                    nullable: true
                }
            }
        );
    };
}
