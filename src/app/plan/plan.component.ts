import { Component, OnDestroy } from '@angular/core';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { PlanData } from './planData.interface';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})

export class PlanComponent implements OnDestroy {
  alive = true;
  plans: Observable<PlanData[]>;

  constructor(private userService: UserService) {
    this.plans = this.userService.planData.pipe();
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
