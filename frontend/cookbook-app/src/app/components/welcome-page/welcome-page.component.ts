import { Component, OnInit } from '@angular/core';
import {CookbookService} from "../../../services/cookbook.service";
import {AppService} from "../../../services/app-service.service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html'
})
export class WelcomePageComponent implements OnInit {
  public hasRecipes: boolean = false;

  constructor(public appService: AppService, public cookbookService: CookbookService, public router: Router) {
  }

  ngOnInit() {
    this.cookbookService.checkExistRecipes().then((hasRecipes: boolean) => {
      this.hasRecipes = hasRecipes;
    });
  }

  public onNavigateToRecipeList() {
    this.router.navigate(['/cookbook']);
  }

  public onCreateExampleRecipes(){
    this.appService.openPageLoading();

    this.cookbookService.setupExampleRecipes().then((result: boolean)=>{
      if (result) {
        this.cookbookService.checkExistRecipes().then((hasRecipes: boolean) => {
          this.hasRecipes = hasRecipes;
          this.appService.closePageLoading();
          this.appService.showSuccessDlg('Die Beispielrezepte wurden erfolgreich erstellt');
        });
      }
    });
  }
}
