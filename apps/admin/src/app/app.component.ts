import { Component } from '@angular/core';
import { Validators } from '@angular/forms';
import {
    EclatFormArrayConfig,
    EclatFormControlConfig,
    EclatFormErrorDirective,
    EclatFormGroup,
    EclatFormGroupConfig
} from '@eclat/form';

export interface TreeNode {
    name: string;
    data: {
        nodes: TreeNode[];
    }
}

@Component({
    selector: 'eclat-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    formGroup: EclatFormGroup<TreeNode> = new EclatFormGroup<TreeNode>(
        new EclatFormGroupConfig(
            {
                name: new EclatFormControlConfig([{
                    key: 'required',
                    message: 'required coi',
                    validator: Validators.required
                }]),
                data: new EclatFormGroupConfig({
                    nodes: new EclatFormArrayConfig(
                        new EclatFormControlConfig([])
                    )
                })
            }
        ),
        {
            name: '',
            data: {
                nodes: []
            }
        }
    );

    public readonly errorMatcher: EclatFormErrorDirective<unknown>['errorMatcher'] = fc => {
        return fc.control.touched || fc.control.dirty;
    };

    ngOnInit(): void {
        setInterval(() => {
            console.log(this.formGroup.value);
        }, 5000);
    }

}
