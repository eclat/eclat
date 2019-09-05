import { assign, cloneDeep } from 'lodash';

export abstract class ValueObject {
    protected constructor() {
    }

    protected clone<T = this>(...partials: Partial<T>[]): this {
        return assign(cloneDeep(this), ...partials);
    }
}
