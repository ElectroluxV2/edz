import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {

  protected currentVersion: string = '1.0';

  constructor(private swUpdate: SwUpdate, private snackBar: MatSnackBar) {
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
      localStorage.setItem('version', this.currentVersion);
    }
  }

  public checkForUpdates(): void {
    if (this.swUpdate.isEnabled) {
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
}
