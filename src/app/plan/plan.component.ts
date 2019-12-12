import { Component, OnDestroy, Renderer2, AfterViewInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { PlanData } from './planData.interface';

@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})

export class PlanComponent implements OnDestroy, AfterViewInit {
  alive = true;
  plans: Observable<PlanData[]>;

  constructor(private userService: UserService, private renderer: Renderer2) {
    this.plans = this.userService.planData.pipe();
  }

  public datePartialEquality(one: Date, two: Date): Boolean {
    if (!(one instanceof Date)) {
      one = new Date(one);
    }

    if (!(two instanceof Date)) {
      two = new Date(two);
    }


    return ((one.getDate() === two.getDate()) && (one.getMonth() === two.getMonth()) && (one.getFullYear() === two.getFullYear()));
  }

  public toggleClass(event: any, value: string): void {
    const hasClass = event.target.classList.contains(value);
  
    if (hasClass) {
      this.renderer.removeClass(event.target, value);
    } else {
      this.renderer.addClass(event.target, value);
    }
  }

  ngOnDestroy(): void {
    this.alive = false;
  }

  ngAfterViewInit(): void {
    const i = new Date().getDay() - 1;
    document.getElementsByTagName('mat-expansion-panel-header')[i].scrollIntoView(true);
  }
}
