import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmDlgComponent} from "../app/components/shared-components/confirm-dlg/confirm-dlg.component";

export class ConfirmDialogHelper {
  private dialog: MatDialog;
  private msg: string = '';
  private details: string = '';

  constructor(dialog: MatDialog, msg: string, details:string = '') {
    this.dialog = dialog;
    this.msg = msg;

    if (details.trim() !== '') {
      this.details = details;
    }
  }

  public afterDecision() {
    return new Promise((resolve) => {
      const dialogRef: MatDialogRef<ConfirmDlgComponent> = this.dialog.open(ConfirmDlgComponent, {
        disableClose: true,
        data: {
          msg: this.msg,
          details: this.details
        }
      });

      dialogRef.afterClosed().toPromise().then((result: boolean) => {
        resolve(result);
      })
    });
  }
}