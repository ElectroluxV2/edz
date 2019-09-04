import { Component, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { GradesDialogComponent } from './dialog';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})

export class GradesComponent implements OnDestroy {
  alive = true;
  users: Observable<User[]>;
  states: boolean[] = [];

  constructor(private userService: UserService, public dialog: MatDialog) {
    this.users = this.userService.getUsers().pipe();
  }

  show(userIndex: number, lessonIndex: number, gradeIndex: number) {

    this.users
    .pipe(takeWhile(() => this.alive))
    .subscribe( users => {
      const grade = users[userIndex].data.grades[lessonIndex].grades[gradeIndex];
      const lessonName = users[userIndex].data.grades[lessonIndex].name;

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
