import { Injectable } from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {PageLoadingComponent} from "../app/components/shared-components/page-loading/page-loading.component";
import {
  SystemMessageDlgComponent
} from "../app/components/shared-components/system-message/system-message-dlg.component";

@Injectable()
export class AppService {
  public static protocol = 'https';
  public static host = '';
  public static port;

  public version: string = '1.0.0';
  public loading: boolean = false;
  private loadingDialogRef: MatDialogRef<PageLoadingComponent> = null;

  constructor(
      private dialog: MatDialog) {
  }

  public static generateApplicationUrl() {
    if (document.domain === 'localhost') {
      AppService.protocol = 'http';
      AppService.port = 4567;
      AppService.host = 'localhost';
    }

    if (AppService.port === undefined) {
      return AppService.protocol + '://' + AppService.host;
    } else {
      return AppService.protocol + '://' + AppService.host + ':' + AppService.port;
    }
  }

  public openPageLoading() {
    if (!this.loading) {
      this.loading = true;

      this.loadingDialogRef = this.dialog.open(PageLoadingComponent, {
        panelClass: 'system-msg',
        disableClose: true,
        restoreFocus: true
      });
    }
  }

  public closePageLoading() {
    this.loadingDialogRef.close();
    this.loading = false;
  }

  public showSuccessDlg(message: string) {
    this.dialog.open(SystemMessageDlgComponent, {
      panelClass: 'system-msg',
      data: {
        msg: message,
        mode: 'success',
        autoClose: true,
      }
    });
  }

  public showErrorDlg(error: string) {
    this.closePageLoading();

    this.dialog.open(SystemMessageDlgComponent, {
      panelClass: 'system-msg',
      data: {
        msg: error,
        mode: 'error',
        autoClose: false,
      }
    });
  }
}