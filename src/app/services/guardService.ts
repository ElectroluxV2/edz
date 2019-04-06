import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { UserService } from './user.service';
import { CanDeactivate } from '@angular/router/src/utils/preactivation';

@Injectable()
export class GuardService implements CanActivate, CanDeactivate {
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

  canDeactivate(component: any, route: ActivatedRouteSnapshot, currentState: RouterStateSnapshot, nextState: RouterStateSnapshot): boolean {
    if (nextState.url.includes('login')) {
      if (this.userService.isLoggedIn()) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }
}
