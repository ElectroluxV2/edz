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

    if (localStorage.getItem('syncState') === 'true') {
      if (this.userService.isLoggedIn()) {
        this.userService.synchronization();
      } else {
        console.warn('Can\'t download updates while user isn\'t logged in');
      }
    }

    // App updates always run
    setTimeout(() => { this.checkForUpdates(); }, parseInt(localStorage.getItem('syncInterval'), 10));
  }

  private promptUser(): void {
    alert('Aktualizacja!');
    this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }
}
