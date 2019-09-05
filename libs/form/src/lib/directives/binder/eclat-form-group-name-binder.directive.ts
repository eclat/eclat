import { ControlContainer, FormGroupName } from '@angular/forms';
import { Directive, forwardRef, Input } from '@angular/core';

@Directive({
    selector: '[eclatFormGroupName]',
    providers: [{
        provide: ControlContainer,
        useExisting: forwardRef(() => EclatFormGroupNameBinderDirective),
    }],
})
export class EclatFormGroupNameBinderDirective<T> extends FormGroupName {
    @Input()
    set eclatFormGroupName(name: string) {
        this.name = name;
    }
}
