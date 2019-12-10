import { UpdateService } from './../services/update.service';
import { ThemeService } from './../services/theme.service';
import { SettingsData } from './settingsData.interface';
import { Component, OnInit } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public users: Observable<SettingsData[]>;
  public syncInProgress: Boolean = false;

  public clicked: Boolean = false;

  get themeSelected(): string {
    return this.themeService.currentTheme;
  }

  get lastSync(): Date {
    return this.userService.lastSync;
  }

  get syncState(): Boolean {
    return (localStorage.getItem('syncState') === 'true');
  }

  get version(): String {
    return this.updateService.version;
  }

  get system(): String {

    if (this.platform.ANDROID) return 'android';
    if (this.platform.IOS) return 'iOS';
    if (this.platform.TRIDENT) return 'windows nt 7';
    if (this.platform.EDGE) return 'windows nt 10';
    if (this.platform.BLINK) return 'blink';
    if (this.platform.FIREFOX) return 'ffx';
    if (this.platform.WEBKIT) return 'macOS';

    return 'hidden';
  }

  get swFetch(): Date {
    return this.updateService.lastSWCheck;
  }

  get updateTime(): Date {
    return this.updateService.lastUpdate;
  }

  get pushStatus(): String {
    return ('PushManager' in window) ? 'suported' : 'not suported';
  }

  public checkUpdate(): void {
    this.updateService.checkForUpdates();
  }

  public changeTheme(event: MatSelectChange): void {
    this.themeService.changeTheme(event.value);
  }

  public changeInterval(event: MatSelectChange): void {
     // Save
     localStorage.setItem('syncInterval', event.value);
  }

  public changeSyncState(event: MatSlideToggleChange): void {
     // Save
     localStorage.setItem('syncState', event.checked.toString());
  }

  constructor(private userService: UserService, private updateService: UpdateService, public platform: Platform, private themeService: ThemeService, private router: Router) {
    this.users = this.userService.settingsData.pipe();
  }

  public deleteUser(login: string): void {
    this.userService.deleteUser(login); 
    // App'll break without user
    if (!this.userService.isAnyoneLoggedIn) {
      this.router.navigate(['login']);
    }
  }

  public sync(): void {
    this.syncInProgress = true;
    this.userService.sync().then(() => {
      this.syncInProgress = false;
      console.log('after');
    }).catch(() => {
      this.syncInProgress = false;
    });
  }

  addUser() {
    localStorage.setItem('bypasLoginComponentLock', 'true');
    this.router.navigate(['login']);
  }

  ngOnInit() { }
}
