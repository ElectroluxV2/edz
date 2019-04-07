import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})

export class PlanComponent implements OnInit, OnDestroy {
  collapsedHeight = '48px';
  expandedHeight = '48px';
  users: Observable<User[]>;

  constructor(private userService: UserService) {
    this.users = this.userService.getUsers().pipe();
    console.error(this.users);
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
