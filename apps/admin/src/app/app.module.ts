import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { EclatFormModule } from '@eclat/form';

import { AppComponent } from './app.component';
import { FormErrorComponent } from './form-error.component';

@NgModule({
    declarations: [AppComponent, FormErrorComponent],
    imports: [
        BrowserModule,
        RouterModule.forRoot([], { initialNavigation: 'enabled' }),
        EclatFormModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
