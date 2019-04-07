import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-grades',
  templateUrl: './grades.component.html',
  styleUrls: ['./grades.component.scss']
})

export class GradesComponent implements OnInit, OnDestroy {
  collapsedHeight = '48px';
  expandedHeight = '48px';
  users: Observable<User[]>;

  constructor(private userService: UserService) {
    this.users = this.userService.getUsers().pipe();
  }

  ngOnInit() { }
  ngOnDestroy() { }
}
