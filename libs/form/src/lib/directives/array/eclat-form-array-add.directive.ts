import { Directive, HostListener, Input } from '@angular/core';
import { EclatFormContainerDirective } from '../eclat-form-container.directive';
import { EclatFormArray } from '../../form-models';

@Directive({
    selector: '[eclatFormAddChildren]',
})
export class EclatFormArrayAddDirective<T> {
    @Input('eclatFormAddChildren')
    value: T;

    constructor(
        private parent: EclatFormContainerDirective<EclatFormArray<any>>,
    ) {
    }

    @HostListener('click', ['$event'])
    onClick(): void {
        const control = this.parent.formControl;

        if (control) {
            control.addChild(this.value);
        }
    }
}

