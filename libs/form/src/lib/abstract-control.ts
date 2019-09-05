import { AbstractControl, AsyncValidatorFn, ValidatorFn } from '@angular/forms';
import { Observable } from 'rxjs';

export interface EclatErrorMapping<T> {
    [key: string]: string | string[] | ((control: AbstractEclatFormControl<T>) => string | string[]);
}

export interface EclatFormRule<T> {
    key: string;
    message: string | string[] | ((control: AbstractEclatFormControl<T>) => string | string[]);
    validator?: ValidatorFn;
    asyncValidator?: AsyncValidatorFn;
}

export abstract class AbstractEclatFormControl<T, C extends AbstractControl = AbstractControl> {
    public control: C;
    protected asyncValidators: AsyncValidatorFn[];
    protected validators: ValidatorFn[];
    private readonly rules: EclatErrorMapping<T>;

    constructor(rules?: EclatFormRule<T>[]) {
        const validators: ValidatorFn[] = [];
        const asyncValidators: AsyncValidatorFn[] = [];
        const errorMapping: EclatErrorMapping<T> = {};

        if (rules) {
            rules.forEach(({ validator, asyncValidator, key, message }) => {
                errorMapping[key] = message;
                if (validator) {
                    validators.push(validator);
                }
                if (asyncValidator) {
                    asyncValidators.push(asyncValidator);
                }
            });
        }

        this.rules = errorMapping;
        this.validators = validators;
        this.asyncValidators = asyncValidators;
    }

    get errorMessages(): string[] {
        if (!this.control.errors) {
            return [];
        }

        return Object.entries(this.control.errors).reduce(
            (acc, [key, value]) => {
                if (value) {
                    const temp = this.rules[key];
                    const errors = typeof temp === 'function' ? temp(this) : temp;

                    if (Array.isArray(errors)) {
                        acc.push(...errors);
                    }
                    else {
                        acc.push(errors);
                    }
                }

                return acc;
            },
            <string[]>[],
        );
    }

    get value(): T {
        return this.control.value;
    }

    get valid(): boolean {
        return this.control.valid;
    }

    get valueChanges(): Observable<T> {
        return this.control.valueChanges;
    }

    public disable(isDisabled: boolean = true, opts?: {
        onlySelf?: boolean;
        emitEvent?: boolean;
    }): void {
        if (isDisabled) {
            this.control.disable(opts);
        } else {
            this.control.enable(opts);
        }
    }

    public abstract patchState(data: T, emitEvent?: boolean): void;

    public abstract resetState(data: T, emitEvent?: boolean): void;
}
