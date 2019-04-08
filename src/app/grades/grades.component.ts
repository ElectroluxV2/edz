import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})

export class GradesComponent implements OnInit, OnDestroy {
  users: Observable<User[]>;
  states: boolean[] = [];

  constructor(private userService: UserService) {
    this.users = this.userService.getUsers().pipe();
  }

  ngOnInit() { }
  ngOnDestroy() { }
}
