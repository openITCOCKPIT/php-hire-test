import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {WelcomePageComponent} from "../../components/welcome-page/welcome-page.component";
import {SharedComponentsModule} from "../shared-componens/shared-components.module";
import {WelcomeRoutingModule} from "./welcome-routing.module";



@NgModule({
  declarations: [
      WelcomePageComponent
  ],
  imports: [
    CommonModule,
    SharedComponentsModule,
    WelcomeRoutingModule
  ]
})
export class WelcomeModule { }
