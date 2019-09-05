import { getMetadataArgsStorage } from 'typeorm';

export function Versionable(): ClassDecorator {
    return target => {
        getMetadataArgsStorage().columns.push({
            target,
            propertyName: 'version',
            mode: 'version',
            options: {
                default: 1
            }
        });
    };
}
