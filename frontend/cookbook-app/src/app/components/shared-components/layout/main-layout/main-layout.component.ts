import { Component } from '@angular/core';
import {AppService} from "../../../../../services/app-service.service";

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html'
})
export class MainLayoutComponent {
  constructor(public appService: AppService) {
  }
}
