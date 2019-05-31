import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { Grade } from '../services/user.service';

export interface DialogData {
  grade: Grade;
  lessonName: string;
}

@Component({
  selector: 'app-grades-dialog',
  templateUrl: 'dialog.html',
  styleUrls: ['./dialog.scss']
})
export class GradesDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
