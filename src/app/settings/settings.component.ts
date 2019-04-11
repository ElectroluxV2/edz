import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material';
import { UserService, User } from '../services/user.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {
  users: Observable<User[]>;
  syncInterval: string;
  syncState: boolean;
  themeSelected: string;

  changeTheme(event: MatSelectChange) {
    // Override
    this.document.body.classList.value = event.value;
    this.overlayContainer.getContainerElement().classList.value = 'cdk-overlay-container ' + event.value;
    // Dirty fix for white background on iOS
    document.body.style.backgroundColor = window.getComputedStyle(this.document.getElementsByClassName('app-frame')[0]).backgroundColor;
    // Save
    localStorage.setItem('theme', event.value);
  }

  changeInterval(event: MatSelectChange) {
     // Save
     localStorage.setItem('syncInterval', event.value);
  }

  changeSyncState(event: MatSlideToggleChange) {
     // Save
     this.syncState = event.checked;
     localStorage.setItem('syncState', event.checked.toString());
  }

  constructor(@Inject(DOCUMENT) private document: Document, private overlayContainer: OverlayContainer, private userService: UserService, private router: Router) {
    this.themeSelected = localStorage.getItem('theme');
    this.syncState = (localStorage.getItem('syncState') === 'true');
    this.syncInterval = localStorage.getItem('syncInterval');
    this.users = this.userService.getUsers().pipe();
  }

  deleteUser(login: string) {
    this.userService.deleteUser(login);
    // Router to login
    if (!this.userService.isLoggedIn()) {
      this.router.navigate(['login']);
    }
  }

  addUser() {
    localStorage.setItem('bypasLoginComponentLock', 'true');
    this.router.navigate(['login']);
  }

  ngOnInit() { }
}
