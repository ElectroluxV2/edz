import { Component, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GradesDialogComponent } from './dialog';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { GradesData } from './gradesData.interface';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})

export class GradesComponent implements OnDestroy {
  alive = true;
  grades: Observable<GradesData[]>;

  constructor(private userService: UserService, public dialog: MatDialog) {
    this.grades = this.userService.gradesData.pipe();
  }

  show(userIndex: number, lessonIndex: number, gradeIndex: number, period: number) {

    this.grades
    .pipe(takeWhile(() => this.alive))
    .subscribe( grades => {

      let grade = {};
      const lessonName = grades[userIndex].grades[lessonIndex].name;
      if (period == 1) {
        grade = grades[userIndex].grades[lessonIndex].primePeriod[gradeIndex];
      } else {
        grade = grades[userIndex].grades[lessonIndex].latterPeriod[gradeIndex];
      }

      const dialogRef = this.dialog.open(GradesDialogComponent, {
        data: {
          grade,
          lessonName
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
