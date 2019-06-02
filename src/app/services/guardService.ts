import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { UserService } from './user.service';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class GuardService implements CanActivate, CanDeactivate<CanComponentDeactivate> {
  component: object;
  route: ActivatedRouteSnapshot;

  constructor(public userService: UserService, public router: Router) {}

  canActivate(): boolean {
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  canDeactivate<T>(
    component: T,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState: RouterStateSnapshot
  ): boolean {

    if (nextState.url.includes('login')) {
      if (this.userService.isLoggedIn()) {
        if (localStorage.getItem('bypasLoginComponentLock')) {
          localStorage.removeItem('bypasLoginComponentLock');
          return true;
        } else {
          return false;
        }
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}
