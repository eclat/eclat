import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EclatFormErrorDirective } from './directives/eclat-form-error.directive';
import { EclatFormGroupDirective } from './directives/group/eclat-form-group.directive';
import { EclatFormGroupNameDirective } from './directives/group/eclat-form-group-name.directive';
import { EclatFormArrayNameDirective } from './directives/array/eclat-form-array-name.directive';
import { EclatFormArrayDirective } from './directives/array/eclat-form-array.directive';
import { EclatFormArrayChildrenDirective } from './directives/array/eclat-form-array-children.directive';
import { EclatFormSubmitDirective } from './directives/eclat-form-submit.directive';
import { EclatFormArrayAddDirective } from './directives/array/eclat-form-array-add.directive';
import { EclatFormValueDirective } from './directives/eclat-form-value.directive';
import { EclatFormGroupBinderDirective } from './directives/binder/eclat-form-group-binder.directive';
import { EclatFormGroupNameBinderDirective } from './directives/binder/eclat-form-group-name-binder.directive';
import { EclatFormArrayNameBinderDirective } from './directives/binder/eclat-form-array-name-binder.directive';
import { EclatFormArrayRemoveDirective } from './directives/array/eclat-form-array-remove.directive';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule],
    declarations: [EclatFormErrorDirective, EclatFormGroupDirective, EclatFormGroupNameDirective, EclatFormArrayDirective, EclatFormArrayNameDirective, EclatFormArrayChildrenDirective, EclatFormSubmitDirective, EclatFormArrayAddDirective, EclatFormValueDirective, EclatFormGroupBinderDirective, EclatFormGroupNameBinderDirective, EclatFormArrayNameBinderDirective, EclatFormArrayRemoveDirective],
    exports: [CommonModule, ReactiveFormsModule, EclatFormErrorDirective, EclatFormGroupDirective, EclatFormGroupNameDirective, EclatFormArrayDirective, EclatFormArrayNameDirective, EclatFormArrayChildrenDirective, EclatFormSubmitDirective, EclatFormArrayAddDirective, EclatFormValueDirective, EclatFormGroupBinderDirective, EclatFormGroupNameBinderDirective, EclatFormArrayNameBinderDirective, EclatFormArrayRemoveDirective],
})
export class EclatFormModule {
}
