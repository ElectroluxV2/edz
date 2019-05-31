import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';
import { MatDialog } from '@angular/material';
import { GradesDialogComponent } from './dialog';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})

export class GradesComponent implements OnInit, OnDestroy {
  users: Observable<User[]>;
  states: boolean[] = [];

  constructor(private userService: UserService, public dialog: MatDialog) {
    this.users = this.userService.getUsers().pipe();
  }

  show(userIndex: number, lessonIndex: number, gradeIndex: number) {

    this.users.subscribe( users => {
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

  ngOnInit() { }
  ngOnDestroy() { }
}
