import { Directive, HostListener, Input } from '@angular/core';
import { EclatFormContainerDirective } from '../eclat-form-container.directive';
import { EclatFormArray } from '../../form-models';

@Directive({
    selector: '[eclatFormRemoveChildren]',
})
export class EclatFormArrayRemoveDirective<T> {
    @Input('eclatFormRemoveChildren')
    index: number;

    constructor(
        private parent: EclatFormContainerDirective<EclatFormArray<any>>,
    ) {
    }

    @HostListener('click', ['$event'])
    onClick(): void {
        const control = this.parent.formControl;

        if (control) {
            control.removeChild(this.index);
        }
    }
}

