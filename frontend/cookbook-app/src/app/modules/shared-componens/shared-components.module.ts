import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {MainLayoutComponent} from "../../components/shared-components/layout/main-layout/main-layout.component";
import {NavigationComponent} from "../../components/shared-components/navigation/navigation.component";
import {DateFormatPipe} from "../../components/shared-components/date-format-pipe/date-format-pipe";
import {MatCardModule} from "@angular/material/card";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {MatDialogModule} from "@angular/material/dialog";
import {SystemMessageDlgComponent} from "../../components/shared-components/system-message/system-message-dlg.component";
import {ConfirmDlgComponent} from "../../components/shared-components/confirm-dlg/confirm-dlg.component";
import {PageLoadingComponent} from "../../components/shared-components/page-loading/page-loading.component";

@NgModule({
  declarations: [
      MainLayoutComponent,
      NavigationComponent,
      DateFormatPipe,
      PageLoadingComponent,
      SystemMessageDlgComponent,
      ConfirmDlgComponent
  ],
  imports: [
      CommonModule,
      FormsModule,
      ReactiveFormsModule,
      MatCardModule,
      MatDialogModule,
  ],
  exports: [
      MainLayoutComponent,
      NavigationComponent,
      DateFormatPipe,
      SystemMessageDlgComponent,
      ConfirmDlgComponent,
      PageLoadingComponent,
      MatCardModule,
      MatDialogModule,
  ]
})
export class SharedComponentsModule { }
