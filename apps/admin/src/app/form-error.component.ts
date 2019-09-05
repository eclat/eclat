import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { EclatFormErrorDirective } from '@eclat/form';

@Component({
    selector: 'form-error',
    template: `
        <ng-template [eclatFormError]="name" [errorMatcher]="errorMatcher" let-error>
            <small class="text-red pt-2"><i class="fas fa-exclamation-circle mr-2"></i> {{ error }} </small>
        </ng-template>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormErrorComponent {
    @Input()
    public name: string = '';

    public readonly errorMatcher: EclatFormErrorDirective<any>['errorMatcher'] = fc => {
        // console.log(fc.control.touched);
        // console.log(fc.control.dirty);
        return fc.control.touched || fc.control.dirty;
    };
}
