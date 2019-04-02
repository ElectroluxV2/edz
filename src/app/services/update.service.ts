import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { UserService, User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(private swUpdate: SwUpdate, private userService: UserService) {
    this.checkForUpdates();
  }

  public checkForUpdates(): void {
    console.log('Checking for updates');

    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate();
      this.swUpdate.available.subscribe(event => this.promptUser());
    }

    if (this.userService.isLoggedIn()) {
      this.userService.synchronization();
    } else {
      console.warn('Can\'t download updates while user isn\'t logged in');
    }

    setTimeout(() => { this.checkForUpdates(); }, 1000 * 60 * 5);
  }

  private promptUser(): void {
    alert('Aktualizacja!');
    this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }
}
