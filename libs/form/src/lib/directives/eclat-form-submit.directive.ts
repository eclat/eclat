import { Directive, HostListener } from '@angular/core';
import { EclatFormContainerDirective } from './eclat-form-container.directive';

@Directive({ selector: '[eclatFormSubmit]' })
export class EclatFormSubmitDirective {
    constructor(private parent: EclatFormContainerDirective<any>) {
    }

    @HostListener('click', ['$event'])
    @HostListener('tap', ['$event'])
    onClick(): void {
        this.parent.submit();
    }
}
