import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { UserService } from './user.service';
import { CanDeactivate } from '@angular/router/src/utils/preactivation';

@Injectable()
export class GuardService implements CanActivate, CanDeactivate {
  component: object;
  route: import ('@angular/router').ActivatedRouteSnapshot;

  constructor(public userService: UserService, public router: Router) {}

  canActivate(): boolean {
    return true;
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  canDeactivate(): boolean {
      return false;
  }
}
