import { ThemeService } from './../services/theme.service';
import { SettingsData } from './settingsData.interface';
import { Component, OnInit, Inject } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public users: Observable<SettingsData[]>;
  public syncInProgress: Boolean = false;

  get themeSelected(): string {
    return this.themeService.currentTheme;
  }

  get lastSync(): Date {
    return this.userService.lastSync;
  }

  get syncState(): Boolean {
    return (localStorage.getItem('syncState') === 'true');
  }

  changeTheme(event: MatSelectChange) {
    this.themeService.changeTheme(event.value);
  }

  changeInterval(event: MatSelectChange) {
     // Save
     localStorage.setItem('syncInterval', event.value);
  }

  changeSyncState(event: MatSlideToggleChange) {
     // Save
     localStorage.setItem('syncState', event.checked.toString());
  }

  constructor(private userService: UserService,private themeService: ThemeService, private router: Router) {
    this.users = this.userService.settingsData.pipe();
  }

  deleteUser(login: string) {
    this.userService.deleteUser(login); 
    // App'll break without user
    if (!this.userService.isAnyoneLoggedIn) {
      this.router.navigate(['login']);
    }
  }

  sync() {
    this.syncInProgress = true;
    this.userService.sync().then(() => {
      this.syncInProgress = false;
      console.log('after');
    });
  }

  addUser() {
    localStorage.setItem('bypasLoginComponentLock', 'true');
    this.router.navigate(['login']);
  }

  ngOnInit() { }
}
