import { ControlContainer, FormArrayName } from '@angular/forms';
import { Directive, forwardRef, Input } from '@angular/core';

@Directive({
    selector: '[eclatFormArrayName]',
    providers: [{
        provide: ControlContainer,
        useExisting: forwardRef(() => EclatFormArrayNameBinderDirective),
    }],
})
export class EclatFormArrayNameBinderDirective<T> extends FormArrayName {
    @Input()
    set eclatFormArrayName(name: string) {
        this.name = name;
    }
}
