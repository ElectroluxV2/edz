import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(private swUpdate: SwUpdate, private userService: UserService) {
    swUpdate.checkForUpdate();
    if (swUpdate.isEnabled) {
      interval(6 * 60 * 60).subscribe(() => swUpdate.checkForUpdate()
        .then(() => console.log('checking for updates')));
    }
  }

  public checkForUpdates(): void {
    if (this.userService.isLoggedIn()) {
      this.userService.synchronization();
    } else {
      console.warn('Can\'t download updates while user isn\'t logged in');
    }

    this.swUpdate.available.subscribe(event => this.promptUser());
  }

  private promptUser(): void {
    alert('Aktualizacja!');
    this.swUpdate.activateUpdate().then(() => {
      document.location.reload();
    });
  }
}
