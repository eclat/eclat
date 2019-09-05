import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AbstractEclatFormControl } from '../abstract-control';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EclatFormContainerDirective } from './eclat-form-container.directive';

class EclatFormValueContext<T> {
    constructor(public control: AbstractEclatFormControl<T>) {
    }

    get $implicit(): T {
        return this.control.value;
    }
}


@Directive({ selector: '[eclatFormValue]' })
export class EclatFormValueDirective<T> implements OnInit, OnDestroy {
    private context?: EclatFormValueContext<T>;
    private latestControlName: string;
    private onDestroy$: Subject<void>;

    constructor(
        private templateRef: TemplateRef<EclatFormValueContext<T>>,
        private viewContainer: ViewContainerRef,
        private parent: EclatFormContainerDirective<any>,
    ) {
        this.onDestroy$ = new Subject();
    }

    @Input()
    set eclatControl(control: AbstractEclatFormControl<T>) {
        this.setContext(control);
    }

    @Input()
    set eclatControlName(controlName: keyof Record<any, T>) {
        if (!this.parent.formControl) {
            throw new Error('parent formControl not exist');
        }

        const instance = this.parent.formControl.getChild(controlName);

        if (!instance) {
            throw new Error('control not found');
            return;
        }

        this.latestControlName = controlName;
        this.setContext(instance);
    }

    @Input() set eclatFormValue(control: AbstractEclatFormControl<T> | keyof Record<any, T>) {
        if (control instanceof AbstractEclatFormControl) {
            this.setContext(control);
        }
        else if (control || control === 0) {
            this.eclatControlName = control;
        }
    }

    ngOnInit(): void {
        this.parent.formControl$.pipe(takeUntil(this.onDestroy$)).subscribe(
            (formControl) => {
                if (formControl && this.latestControlName) {
                    this.eclatFormValue = formControl.getChild(this.latestControlName);
                }
            },
        );
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

    private setContext(control: AbstractEclatFormControl<T>) {
        if (!this.context) {
            this.context = new EclatFormValueContext<T>(control);
            this.viewContainer.createEmbeddedView(this.templateRef, this.context);
        }
        else if (this.context.control !== control) {
            this.context.control = control;
        }
    }
}
