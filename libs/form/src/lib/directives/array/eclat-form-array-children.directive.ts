import { Directive, EmbeddedViewRef, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { EclatFormContainerDirective } from '../eclat-form-container.directive';
import { EclatFormArray, EclatFormChild } from '../../form-models';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Directive({
    selector: '[eclatFormArrayChildren]',
})
export class EclatFormArrayChildrenDirective<T> implements OnInit, OnDestroy {
    private onDestroy$: Subject<void>;
    private latestChildren: EclatFormChild<any>[];
    private valueChangeSubs: Subscription | null;

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private parent: EclatFormContainerDirective<EclatFormArray<any>>,
    ) {
        this.onDestroy$ = new Subject();
        this.latestChildren = [];
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

    ngOnInit(): void {
        this.parent.formControl$.pipe(takeUntil(this.onDestroy$)).subscribe(
            (formControl) => {
                if (formControl) {
                    if (this.valueChangeSubs) {
                        this.valueChangeSubs.unsubscribe();
                    }

                    this.onChange(formControl);
                    this.valueChangeSubs = formControl.valueChanges.pipe(takeUntil(this.onDestroy$)).subscribe(
                        () => {
                            this.onChange(formControl);
                        },
                    );
                }
            },
        );
    }

    private onChange(control: EclatFormArray<any>): void {
        const children: EclatFormChild<any>[] = [];
        const controlChildrenLength: number = control.children.length;

        control.children.forEach(
            (c, index) => {
                const lastIndex = this.latestChildren.findIndex(o => o === c);
                const first: boolean = index === 0;
                const last: boolean = index === (controlChildrenLength - 1);

                if (lastIndex < 0) {
                    this.viewContainer.createEmbeddedView(this.templateRef, { $implicit: index, last, first }, index);
                } else if (lastIndex !== index) {
                    const embeddedView: EmbeddedViewRef<any> = <EmbeddedViewRef<any>>this.viewContainer.get(lastIndex)!;
                    embeddedView.context.$implicit = index;
                    embeddedView.context.last = last;
                    embeddedView.context.first = first;

                    this.viewContainer.move(embeddedView, index);
                }

                children.push(c);
            },
        );
        while (this.viewContainer.length > controlChildrenLength) {
            this.viewContainer.remove();
        }

        this.latestChildren = children;
    }
}

