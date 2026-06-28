import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {AppService} from "../../../../services/app-service.service";

@Component({
  selector: 'app-system-message',
  templateUrl: './system-message-dlg.component.html',
  styleUrls: ['./system-message-dlg.component.scss']
})
export class SystemMessageDlgComponent implements OnInit {
  public msg = '';
  public mode = 'normal';
  public autoClose: boolean = true;

  constructor(
    public appService: AppService,
    public dialogRef: MatDialogRef<SystemMessageDlgComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {msg: string, mode: string, autoClose: boolean}) {
  }

  ngOnInit() {
    this.msg = this.data.msg;
    this.mode = this.data.mode;
    this.autoClose = this.data.autoClose;

    if (this.autoClose) {
      setTimeout(() => {
        this.dialogRef.close();
      }, 5000);
    }
  }

  public onClose() {
    this.dialogRef.close();
  }
}
