import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {AppService} from "../services/app-service.service";
import {HttpClientModule} from "@angular/common/http";
import {CookbookService} from "../services/cookbook.service";
import {CookbookDummyService} from "../services/cookbook-dummy.service";
import {PageLoadingComponent} from './components/shared-components/page-loading/page-loading.component';
import {SharedComponentsModule} from "./modules/shared-componens/shared-components.module";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    SharedComponentsModule,
    BrowserAnimationsModule
  ],
  providers: [
      AppService,
      CookbookService,
      CookbookDummyService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
