import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { interval } from 'rxjs';
import { UserService, User } from './user.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  constructor(private swUpdate: SwUpdate, private userService: UserService, private router: Router, private snackBar: MatSnackBar) {
    this.checkForUpdates();
    if (!this.userService.isLoggedIn()) {
      // Fresh install check
      if (!localStorage.getItem('version')) {
        // Defaults
        localStorage.setItem('version', '0.5');
        localStorage.setItem('theme', 'kn-purple-13');
        localStorage.setItem('syncState', 'true');
        localStorage.setItem('syncInterval', '1800000');
      } else {
        // Per version changes
        switch (localStorage.getItem('version')) {
          case '0.4':
          break;
        }
      }
    } else {
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
        if (localStorage.getItem('syncState') === 'true') {
          setTimeout(() => { this.sync(); }, parseInt(localStorage.getItem('syncInterval'), 10));
        }
      });
    } else {
      console.warn('Can\'t sync data while user isn\'t logged in');
    }
  }
}
