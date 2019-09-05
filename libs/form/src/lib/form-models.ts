import { AbstractControl, FormArray, FormControl, FormGroup } from '@angular/forms';
import {
    ControlRuleConfig,
    EclatConfig,
    EclatFormArrayConfig,
    EclatFormControlConfig,
    EclatFormGroupConfig,
} from './contracts/form-config';
import { AbstractEclatFormControl } from './abstract-control';

export type EclatFormChild<T> =
    EclatFormControl<T>
    | (T extends unknown[] ? EclatFormArray<T> : EclatFormGroup<T>)

export class EclatFormControl<T> extends AbstractEclatFormControl<T,
    FormControl> {
    constructor(config: EclatFormControlConfig<T>, initialData?: T) {
        super(config.rules);
        this.control = new FormControl(null, this.validators, this.asyncValidators);

        if (initialData) {
            this.resetState(initialData, false);
        }
    }

    public patchState(data: T, emitEvent: boolean = true): void {
        this.control.patchValue(data, { emitEvent });
    }

    public resetState(data: T, emitEvent: boolean = true): void {
        this.control.reset(data, { emitEvent });
    }
}

export class EclatFormGroup<T> extends AbstractEclatFormControl<T, FormGroup> {
    public children: { [P in keyof T]: EclatFormChild<T[P]> };

    constructor(dfg: EclatFormGroupConfig<T>, initialData?: T) {
        super(dfg.rules);

        const { children, controls } = Object.entries(dfg.controlsRules).reduce(
            (acc, cur) => {
                const [key, value] = cur;
                const eclatControl = (value as EclatConfig<any>).getControl();

                if (eclatControl) {
                    acc.children[key as keyof T] = eclatControl;
                    acc.controls[key] = eclatControl.control;
                }

                return acc;
            },
            { children: {} as EclatFormGroup<T>['children'], controls: {} as Record<string, AbstractControl> },
        );

        this.control = new FormGroup(controls, this.validators, this.asyncValidators);
        this.children = children;

        if (initialData) {
            this.resetState(initialData, false);
        }
    }

    public patchState(data: T, emitEvent: boolean = true): void {
        if (!data) {
            console.warn(`Expect an object, but ${data} is given`);
            return;
        }

        Object.entries(data).forEach(([key, value]) => {
            if (this.children[key as keyof T]) {
                this.children[key as keyof T].patchState(value, false);
            }
        });
        this.control.updateValueAndValidity({ emitEvent });
    }

    public resetState(data: T, emitEvent: boolean = true): void {
        if (!data) {
            console.warn(`Expect an object, but ${data} is given`);
            return;
        }

        Object.entries(data).forEach(([key, value]) => {
            if (this.children[key as keyof T]) {
                this.children[key as keyof T].resetState(value, false);
            }
        });
        this.control.updateValueAndValidity({ emitEvent });
    }

    public getChild<P extends keyof T>(key: P): EclatFormChild<T[P]> {
        return this.children[key];
    }

    private addChild(
        key: keyof T & string,
        config: ControlRuleConfig<T>,
        data: T,
    ): void {
        const eclatControl = config.getControl();

        if (eclatControl) {
            eclatControl.resetState(data);

            this.children[key] = eclatControl as unknown as EclatFormChild<T[typeof key]>;
            this.control.addControl(key, this.children[key].control);
        }
    }

    private removeChild(key: keyof T & string): void {
        delete this.children[key];
        this.control.removeControl(key);
    }
}

export class EclatFormArray<T extends any[]> extends AbstractEclatFormControl<T,
    FormArray> {
    public children: EclatFormChild<T[0]>[];
    private childConfig: ControlRuleConfig<T[0]>;

    constructor(dfa: EclatFormArrayConfig<T>, initialData?: T) {
        super(dfa.rules);

        this.control = new FormArray([], this.validators, this.asyncValidators);
        this.childConfig = dfa.controlConfig;
        this.children = [];

        if (initialData) {
            this.resetState(initialData, false);
        }
    }

    public addChild(data?: Partial<T[0]>): void {
        const eclatControl = this.childConfig.getControl(data);
        if (eclatControl) {
            eclatControl.resetState(data);

            this.children.push(eclatControl as EclatFormChild<T[0]>);
            this.control.push(eclatControl.control);
        }
    }

    public removeChild(index: number): void {
        this.children.splice(index, 1);
        this.control.removeAt(index);
    }

    public patchState(data: T, emitEvent: boolean = true): void {
        if (!data) {
            console.warn(`Expect an array, but ${data} is given`);
            return;
        }

        this.control.clear();
        this.children = [];

        data.forEach(d => {
            const eclatControl = this.childConfig.getControl(d);
            if (eclatControl) {
                this.children.push(eclatControl as EclatFormChild<T[0]>);
                this.control.push(eclatControl.control);
            }
        });
        this.control.updateValueAndValidity({ emitEvent });
    }

    public resetState(data: T, emitEvent: boolean = true): void {
        if (!data) {
            console.warn(`Expect an array, but ${data} is given`);
            return;
        }

        this.control.clear();
        this.children = [];

        data.forEach(d => {
            const eclatControl = this.childConfig.getControl(d);
            if (eclatControl) {
                this.children.push(eclatControl as EclatFormChild<T[0]>);
                this.control.push(eclatControl.control);
            }
        });
        this.control.updateValueAndValidity({ emitEvent });
    }

    public getChild(index: number): EclatFormChild<T[0]> {
        return this.children[index];
    }
}
