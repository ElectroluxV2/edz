import { Component, OnInit } from '@angular/core';
import { Plan } from './plan';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { interval } from 'rxjs';
import { AppComponent } from '../app.component';


@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})

export class PlanComponent implements OnInit{
  plan: Plan;
  jp2mode = false;

  jp2() {
    const minutes = new Date().getMinutes();
    if (minutes === 37) {
      this.appComponent.next();
      setTimeout(() => { this.jp2(); }, 20);
    }
  }

  constructor(private userService: UserService, private router: Router, private appComponent: AppComponent) {
    this.getPlanForCurrentUser();

    // Co sekundę
    interval(1000).subscribe(() => {

      // Czas
      const hours = new Date().getHours();
      const minutes = new Date().getMinutes();

      if ((hours === 21) && (minutes === 37)) {
        this.jp2mode = true;
        this.jp2();
      } else {
        this.jp2mode = false;
      }
    });
  }

  getPlanForCurrentUser() {
    this.plan = this.userService.users[0].data.plan;
  }

  ngOnInit(): void { }
}
