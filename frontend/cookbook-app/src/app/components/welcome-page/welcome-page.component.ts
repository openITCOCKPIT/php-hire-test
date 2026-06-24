import { Component, OnInit } from '@angular/core';
import {CookbookService} from "../../../services/cookbook.service";

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html'
})
export class WelcomePageComponent implements OnInit {

  constructor(public cookbookService: CookbookService) { }

  ngOnInit(): void {
  }

  onTestGet() {
    this.cookbookService.testRequestGet();
  }

  onTestPost() {
    this.cookbookService.testRequestPost();
  }

}
