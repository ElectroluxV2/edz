import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService, Plan, User } from '../services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { interval, Subscription, Observable } from 'rxjs';
import { AppComponent } from '../app.component';


@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})

export class PlanComponent implements OnInit, OnDestroy {
  collapsedHeight = '48px';
  expandedHeight = '48px';
  jp2mode = false;
  users: Observable<User[]>;

  jp2() {
     // Czas
     const hours = new Date().getHours();
     const minutes = new Date().getMinutes();

     if ((hours === 21) && (minutes === 37)) {
       this.jp2mode = true;
       this.jp2();
     } else {
       this.jp2mode = false;
     }
     setTimeout(() => { this.jp2(); }, 1500);
  }

  jp22() {
    const minutes = new Date().getMinutes();
    if (minutes === 37) {
      setTimeout(() => { this.jp22(); }, 20);
    }
  }

  constructor(private userService: UserService, private appComponent: AppComponent) {
    this.users = this.userService.getUsers().pipe();
    console.error(this.users);
    
  }

  ngOnInit(): void {

  }

  ngOnDestroy(): void {

  }
}
