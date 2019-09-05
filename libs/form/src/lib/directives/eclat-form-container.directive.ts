import { BehaviorSubject, Observable } from 'rxjs';
import { AbstractEclatFormControl } from '../abstract-control';
import { EventEmitter, Output } from '@angular/core';

export abstract class EclatFormContainerDirective<T extends AbstractEclatFormControl<any>> {
    @Output()
    private onSubmit: EventEmitter<any>;

    protected constructor() {
        this._formControl = new BehaviorSubject<T | undefined>(undefined);
        this.onSubmit = new EventEmitter();
    }

    protected _formControl: BehaviorSubject<T | undefined>;

    get formControl(): T | undefined {
        return this._formControl.getValue();
    }

    get formControl$(): Observable<T | undefined> {
        return this._formControl.asObservable();
    }

    submit(): void {
        if (this.formControl) {
            this.onSubmit.emit(this.formControl.value);
        }
    }

    abstract getChild(key: any): AbstractEclatFormControl<any> | undefined;
}
