import { UserService } from './user.service';
import { Injectable, OnDestroy } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable()
export class GuardService implements CanActivate, CanDeactivate<CanComponentDeactivate>, OnDestroy {
  protected alive: boolean = true;
  public component: object;
  public route: ActivatedRouteSnapshot;

  constructor(public router: Router, private userService: UserService) { }

  canActivate(): boolean {
    if (this.userService.isAnyoneLoggedIn) {
      return true;
    } else {
      this.router.navigate(['login']);
      return false;
    }
  }

  canDeactivate<T>(c: T, cr: ActivatedRouteSnapshot, cs: RouterStateSnapshot,  nextState: RouterStateSnapshot): boolean {
    if (nextState.url.includes('login')) {
      if (this.userService.isAnyoneLoggedIn) {
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

  ngOnDestroy(): void {
    this.alive = false;
  }
}
