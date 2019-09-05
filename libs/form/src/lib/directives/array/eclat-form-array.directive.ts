import { Directive, forwardRef, Input } from '@angular/core';
import { EclatFormArray, EclatFormChild } from '../../form-models';
import { EclatFormContainerDirective } from '../eclat-form-container.directive';

@Directive({
    selector: '[eclatFormArray]',
    providers: [{
        provide: EclatFormContainerDirective,
        useExisting: forwardRef(() => EclatFormArrayDirective),
    }],
})
export class EclatFormArrayDirective<T extends any[]> extends EclatFormContainerDirective<EclatFormArray<T>> {
    constructor() {
        super();
    }

    @Input()
    set eclatFormArray(formArray: EclatFormArray<T>) {
        this._formControl.next(formArray);
    }

    getChild(key: number): EclatFormChild<T[any]> | undefined {
        if (this.formControl) {
            return this.formControl.getChild(key);
        }

        return undefined;
    }
}

