import { UpdateService } from './../services/update.service';
import { ThemeService } from './../services/theme.service';
import { SettingsData } from './settingsData.interface';
import { Component } from '@angular/core';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/internal/Observable';
import { Platform } from '@angular/cdk/platform';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public users: Observable<SettingsData[]>;
  public syncInProgress: Boolean = false;
  public clicked: Boolean = false;
  public pushStatus: String = 'n/a';
  public pushSlideDisable: Boolean = false;

  constructor(private userService: UserService, private swPush: SwPush, private updateService: UpdateService, public platform: Platform, private themeService: ThemeService, private router: Router) {
    this.users = this.userService.settingsData.pipe();
    if (!this.checkPush()) {
      this.pushSlideDisable = true;
    } else {
      if (localStorage.getItem('pushEnabled')) {
        this.pushStatus = 'Enabled';
      } else {
        this.pushStatus = 'Disabled';
      }
    }
  }

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

  get pushSupport(): String {
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
    }).catch(() => {
      this.syncInProgress = false;
    });
  }

  public addUser(): void {
    localStorage.setItem('bypasLoginComponentLock', 'true');
    this.router.navigate(['login']);
  }

  private async checkPush() {
    if (!('Notification' in window)) {
      this.pushStatus = 'Not supported';
      return false;
    }

    // Check permission
    if (Notification.permission === 'denied') {
      this.pushStatus = 'Denied by User';
      return false;
    }

    if (!this.swPush.isEnabled) {
      this.pushStatus = 'Disabled';
      return false;
    }

    return true;
  }

  public async changePush(event: MatSlideToggleChange) {
    
    if (!event.checked) {
      // TODO: Unsubsribe from push
      return;
    }

    if (!await this.checkPush()) {
      this.pushSlideDisable = true;
      return;
    }

    if (Notification.permission !== 'granted') {
      // Wait for permission
      await Notification.requestPermission().then((permission) => {
        if (permission !== "granted") {
          this.pushStatus = 'Denied by User';
          this.pushSlideDisable = true;
          return false;
        }
      });
    }

    const sub: PushSubscription = await this.swPush.requestSubscription({
      serverPublicKey: 'BChzVNI5o39Ym-l8fKmnqNuXT6DKuNcM72OomLxHspYa1IwGX269bOkel_us-UXlGhY7w1soGJGNSX2h2GEUEDY',
    }).catch((e) => {
      this.pushStatus = 'Denied by User';
      return;
    }).then((sub: PushSubscription) => {
      this.pushStatus = 'Enabled';
      localStorage.setItem('pushEnabled', 'true');
      sub ? this.userService.enablePush(sub.endpoint): '';
    }) as PushSubscription;
  }
}
