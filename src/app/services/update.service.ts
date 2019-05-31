import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { UserService } from './user.service';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  currentVersion = '0.7';

  constructor(private swUpdate: SwUpdate, private userService: UserService, private snackBar: MatSnackBar) {
    this.checkForUpdates();

    if (!this.userService.isLoggedIn()) {
      // Fresh install check
      if (!localStorage.getItem('version')) {
        // Defaults
        localStorage.setItem('version', this.currentVersion);
        localStorage.setItem('theme', 'kn-purple-13');
        localStorage.setItem('syncState', 'true');
        localStorage.setItem('syncInterval', '1800000');
      } else {
        // Per version changes
        switch (localStorage.getItem('version')) {
          case '0.5':
            break;
        }
      }
    } else {
      if (localStorage.getItem('version') !== this.currentVersion) {
        localStorage.setItem('version', this.currentVersion);
      }
      this.sync();
    }
  }

  public checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      console.log('Checking for updates');
      this.swUpdate.checkForUpdate();
      this.swUpdate.available.subscribe(event => {
        this.snackBar.open('Aktualizacja!', 'odśwież').onAction().subscribe(() => {
          this.swUpdate.activateUpdate().then(() => {
            document.location.reload();
          });
        });
      });
    }
  }

  private sync() {
    if (this.userService.isLoggedIn()) {
      this.userService.synchronization().then(() => {
        localStorage.setItem('lastSync', new Date().toISOString());
        if (localStorage.getItem('syncState') === 'true') {
          setTimeout(() => { this.sync(); }, parseInt(localStorage.getItem('syncInterval'), 10));
        }
      });
    } else {
      console.warn('Can\'t sync data while user isn\'t logged in');
    }
  }
}
