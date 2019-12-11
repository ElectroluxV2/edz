import { UserService } from './user.service';
import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  protected currentVersion: string = '1.0.1';

  get version(): String {
    return this.currentVersion;
  }

  get lastSWCheck(): Date {
    return new Date(localStorage.getItem('lastSWCheck'));
  }

  get lastUpdate(): Date {
    return new Date(localStorage.getItem('lastUpdate'));
  }

  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar, private userService: UserService) {
    this.checkForUpdates();

    if (!localStorage.getItem('version')) {
      // Defaults
      localStorage.setItem('version', this.currentVersion);
      localStorage.setItem('theme', 'kn-purple-13');
      localStorage.setItem('push', 'false');
    }

    // Per version changes
    switch (localStorage.getItem('version')) {
      case '0.5':
        break;
    }

    if (localStorage.getItem('version') !== this.currentVersion) {

      Swal.fire({
        title: 'Wprowadzanie zmian',
        text: 'Twa wprowadzanie zmian w nowej wersji',
        type: 'info',
        allowOutsideClick: false,
      });
  
      Swal.showLoading();
      // Prevent data incompatible
      this.userService.sync().then(() => {
        localStorage.setItem('version', this.currentVersion);
        Swal.close();
      })
    }
  }

  public checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.checkForUpdate().then(() => {
        localStorage.setItem('lastSWCheck', new Date().toString());
      });
      this.swUpdate.available.subscribe(event => {
        this.snackBar.open('Aktualizacja!', 'odśwież').onAction().subscribe(() => {
          this.swUpdate.activateUpdate().then(() => {
            localStorage.setItem('lastUpdate', new Date().toString());
            document.location.reload();
          });
        });
      });
    }
  }
}
