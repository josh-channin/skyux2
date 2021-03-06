import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { SkyAlertModule } from '../alert.module';

import { Bootstrapper } from '../../../../visual/bootstrapper';

@Component({
  selector: 'sky-demo-app',
  templateUrl: './alert.component.visual-fixture.html'
})
class AppComponent {
  public alertCloseable = true;
}

@NgModule({
  imports: [
    BrowserModule,
    SkyAlertModule
  ],
  declarations: [
    AppComponent
  ],
  bootstrap: [
    AppComponent
  ]
})
class AppModule { }

Bootstrapper.bootstrapModule(AppModule);
