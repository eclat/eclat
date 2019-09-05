import { Component } from '@angular/core';
import { EclatFormArrayConfig, EclatFormControlConfig, EclatFormGroup, EclatFormGroupConfig } from '@eclat/form';

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
    title = 'admin';
    formGroup: EclatFormGroup<TreeNode> = new EclatFormGroup(
        new EclatFormGroupConfig(
            {
                name: new EclatFormControlConfig([]),
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

    ngOnInit(): void {
        console.log(
            new EclatFormGroupConfig(
                {
                    name: new EclatFormControlConfig([]),
                    data: new EclatFormGroupConfig({
                        nodes: new EclatFormArrayConfig(
                            new EclatFormControlConfig([])
                        )
                    })
                }
            ).setRecursive('data.nodes.0')
        );
        setInterval(() => {
            console.log(this.formGroup.value);
        }, 5000);
    }

}
