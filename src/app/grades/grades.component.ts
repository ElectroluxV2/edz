import { Router } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GradesDialogComponent } from './dialog';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { GradesData, Grade } from './gradesData.interface';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})

export class GradesComponent implements OnDestroy {
  alive = true;
  grades: Observable<GradesData[]>;

  constructor(private userService: UserService, public dialog: MatDialog, private router: Router) {
    this.grades = this.userService.gradesData.pipe();

    this.grades
    .pipe(takeWhile(() => this.alive))
    .subscribe(data => {

      for (const datas of data) {
        for (const subject of datas.grades) {
          for (const mark of subject.primePeriod) {
            if (mark.new) {
              this.openDialog(mark, subject.name);
              // Prevent dupes
              this.userService.removeNewFromGrade(datas.userLogin, subject.name, mark);
              break;
            }
          }
          for (const mark of subject.latterPeriod) {
            if (mark.new) {
              this.openDialog(mark, subject.name);
              // Prevent dupes
              this.userService.removeNewFromGrade(datas.userLogin, subject.name, mark);
              break;
            }
          }
        }
      }
    });

    const navigation = this.router.getCurrentNavigation();
    const state = navigation.extras.state as {
      userIndex: number,
      lessonIndex: number,
      gradeIndex: number,
      peroid: number,
    };

    if (!state) return; // No grade to pre show

    this.show(state.userIndex, state.lessonIndex, state.gradeIndex, state.peroid);
  }

  private openDialog(grade: Grade, lessonName: string): MatDialogRef<GradesDialogComponent> {
    return this.dialog.open(GradesDialogComponent, {
      data: {
        grade,
        lessonName
      }
    });
  }

  show(userIndex: number, lessonIndex: number, gradeIndex: number, period: number) {

    this.grades
    .pipe(takeWhile(() => this.alive))
    .subscribe(grades => {

      let grade: Grade = null;
      const lessonName = grades[userIndex].grades[lessonIndex].name;
      if (period == 1) {
        grade = grades[userIndex].grades[lessonIndex].primePeriod[gradeIndex];
      } else {
        grade = grades[userIndex].grades[lessonIndex].latterPeriod[gradeIndex];
      }

      this.openDialog(grade, lessonName);
    });
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
