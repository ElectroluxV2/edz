import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
    date: Date;
    //exams: Exam[];
    //homeworks: Homework[];
}

@Component({
    selector: 'app-cal-dialog',
    templateUrl: 'dialog.html',
    styleUrls: ['./dialog.scss']
})
export class CalendarDialogComponent {
    constructor(@Inject(MAT_DIALOG_DATA) public data: DialogData) {}
}
