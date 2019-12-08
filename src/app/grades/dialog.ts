import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Grade } from './gradesData.interface';

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
