import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})

export class PlanComponent implements OnInit, OnDestroy {
  users: Observable<User[]>;
  states: boolean[] = [];
  empty: boolean[] = [];

  constructor(private userService: UserService) {
    this.users = this.userService.getUsers().pipe();

    this.users.subscribe((users: User[]) => {
      for (const user of users) {

        // True if there is no lessions in that day
        let empty = true;
        for (const lesson of user.data.plan.monday) {
          if (!lesson.empty) {
            empty = false;
          }
        }
        this.empty[0] = empty;
        for (const lesson of user.data.plan.tuesday) {
          if (!lesson.empty) {
            empty = false;
          }
        }
        this.empty[1] = empty;
        for (const lesson of user.data.plan.wednesday) {
          if (!lesson.empty) {
            empty = false;
          }
        }
        this.empty[2] = empty;
        for (const lesson of user.data.plan.thursday) {
          if (!lesson.empty) {
            empty = false;
          }
        }
        this.empty[3] = empty;
        for (const lesson of user.data.plan.friday) {
          if (!lesson.empty) {
            empty = false;
          }
        }
        this.empty[4] = empty;
      }
    });
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
