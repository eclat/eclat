import { AbstractControl } from '@angular/forms';
import { AbstractEclatFormControl, EclatFormRule } from '../abstract-control';
import { EclatFormArray, EclatFormControl, EclatFormGroup } from '../form-models';

export abstract class EclatConfig<T extends AbstractEclatFormControl<any, AbstractControl>> {
    abstract getControl(data?: T['value']): T;

    public setRecursive(path: string, config: EclatConfig<any> = this): this {
        const [currentPath, ...restPath] = path.split('.');

        if (restPath.length === 0) {
            if (this instanceof EclatFormGroupConfig) {
                this.controlsRules[currentPath] = config;
            } else if (this instanceof EclatFormArrayConfig) {
                (this as any).controlConfig = config;
            } else {
                throw new Error('alpha, please contact if needed');
            }
        } else {
            if (this instanceof EclatFormGroupConfig) {
                this.controlsRules[currentPath].setRecursive(restPath.join('.'), config);
            } else if (this instanceof EclatFormArrayConfig) {
                this.controlConfig.setRecursive(restPath.join('.'), config);
            } else {
                throw new Error('alpha, please contact if needed');
            }
        }

        return this;
    }
}

export type ControlRuleConfig<T> =
    EclatFormControlConfig<T>
    | (T extends unknown[] ? EclatFormArrayConfig<T> : EclatFormGroupConfig<T>);

export class EclatFormControlConfig<T> extends EclatConfig<EclatFormControl<T>> {
    public constructor(public readonly rules: EclatFormRule<T>[]) {
        super();
    }

    public getControl(data?: T): EclatFormControl<T> {
        return new EclatFormControl(this, data);
    }
}

export class EclatFormGroupConfig<T> extends EclatConfig<EclatFormGroup<T>> {
    public readonly controlsRules: ControlRuleConfig<T> | { [P in keyof T]: ControlRuleConfig<T[P]> };
    public readonly rules?: EclatFormRule<T>[];

    public constructor(
        controlsRules: { [P in keyof T]: ControlRuleConfig<T[P]> | EclatFormRule<T[P]>[] },
        rules?: EclatFormRule<T>[]
    ) {
        super();
        this.controlsRules = Object.entries<any>(controlsRules).reduce(
            (acc, [key, value]) => {
                acc[key] = Array.isArray(value) ? new EclatFormControlConfig(value) : value;
                return acc;
            },
            {}
        ) as any;
        this.rules = rules;
    }

    public getControl(data?: T): EclatFormGroup<T> {
        return new EclatFormGroup(this, data);
    }
}

export class EclatFormArrayConfig<T extends unknown[]> extends EclatConfig<EclatFormArray<T>> {
    public readonly controlConfig: ControlRuleConfig<T[0]>;
    public readonly rules?: EclatFormRule<T>[];

    public constructor(
        controlConfig: ControlRuleConfig<T[0]> | EclatFormRule<T[0]>[],
        rules?: EclatFormRule<T>[]
    ) {
        super();
        this.controlConfig = Array.isArray(controlConfig) ? new EclatFormControlConfig(controlConfig) : controlConfig;
        this.rules = rules;
    }

    public getControl(data?: T): EclatFormArray<T> {
        return new EclatFormArray(this, data);
    }
}
