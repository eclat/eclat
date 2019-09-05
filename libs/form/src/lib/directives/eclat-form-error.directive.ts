import { Directive, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AbstractEclatFormControl } from '../abstract-control';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { EclatFormContainerDirective } from './eclat-form-container.directive';

class EclatFormErrorContext<T> {
    constructor(public control: AbstractEclatFormControl<T>) {
    }

    get $implicit(): string[] {
        return this.control.errorMessages;
    }
}


@Directive({ selector: '[eclatFormError]' })
export class EclatFormErrorDirective<T> implements OnInit, OnDestroy {
    @Input()
    errorMatcher: (control: AbstractEclatFormControl<T>) => boolean;
    private context?: EclatFormErrorContext<T>;
    private latestControlName: string;
    private onDestroy$: Subject<void>;
    private valueChangesSub?: Subscription;

    constructor(
        private templateRef: TemplateRef<EclatFormErrorContext<T>>,
        private viewContainer: ViewContainerRef,
        private parent: EclatFormContainerDirective<any>,
    ) {
        this.onDestroy$ = new Subject();
        this.errorMatcher = () => true;
    }

    @Input()
    set eclatControl(control: AbstractEclatFormControl<T>) {
        this.setContext(control);
    }

    @Input()
    set eclatControlName(controlName: keyof Record<any, T> | undefined) {
        if (!this.parent.formControl) {
            throw new Error('parent formControl not exist');
        }

        const instance = !controlName ? this.parent.formControl :  this.parent.formControl.getChild(controlName);

        if (!instance) {
            throw new Error('control not found');
            return;
        }

        this.latestControlName = controlName;
        this.setContext(instance);
    }

    @Input() set eclatFormError(control: AbstractEclatFormControl<T> | keyof Record<any, T>) {
        if (control instanceof AbstractEclatFormControl) {
            this.setContext(control);
        }
        else {
            this.eclatControlName = control;
        }
    }

    ngOnInit(): void {
        this.parent.formControl$.pipe(takeUntil(this.onDestroy$)).subscribe(
            (formControl) => {
                if (formControl && this.latestControlName) {
                    this.eclatFormError = formControl.getChild(this.latestControlName);
                }
            },
        );
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

    private setContext(control: AbstractEclatFormControl<T>) {
        if (!this.context) {
            this.context = new EclatFormErrorContext<T>(control);
            this.viewContainer.createEmbeddedView(this.templateRef, this.context);
        }
        else if (this.context.control !== control) {
            this.context.control = control;
        }
        if (this.valueChangesSub) {
            this.valueChangesSub.unsubscribe();
        }

        this.checkValidity(control);
        this.valueChangesSub = control.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(
            () => {
                this.checkValidity(control);
            },
        );
    }

    private checkValidity(control: AbstractEclatFormControl<T>): void {
        const isAttached = !!this.viewContainer.length;

        if (!control.valid && this.errorMatcher(control)) {
            if (!isAttached) {
                this.viewContainer.createEmbeddedView(this.templateRef, this.context);
            }
        }
        else {
            if (isAttached) {
                this.viewContainer.remove();
            }
        }
    }
}
