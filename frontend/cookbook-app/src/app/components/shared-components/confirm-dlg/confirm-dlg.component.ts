import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-confirm-dlg',
  templateUrl: './confirm-dlg.component.html',
  styleUrls: ['./confirm-dlg.component.scss']
})
export class ConfirmDlgComponent implements OnInit {
  public msg: string = '';
  public details: string = '';

  constructor(
    public dialogRef: MatDialogRef<ConfirmDlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      msg: string
      details: string
      yesCaseTranslation: string,
      noCaseTranslation: string,
    }) {
  }

  ngOnInit() {
    this.msg = this.data.msg;
    this.details = this.data.details;
  }

  public onConfirm() {
    this.dialogRef.close(true);
  }

  public onClose() {
    this.dialogRef.close(false);
  }
}
