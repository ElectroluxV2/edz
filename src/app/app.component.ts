import { Component, Inject } from '@angular/core';
import { UpdateService } from './services/update.service';
import { UserService } from './services/user.service';
import { OverlayContainer } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})


export class AppComponent {
  title = 'EDZ';

  constructor(private update: UpdateService,
              private userService: UserService,
              private overlayContainer: OverlayContainer,
              @Inject(DOCUMENT) private document: Document) {
    this.update.checkForUpdates();

    const theme = localStorage.getItem('theme');

    // Override
    this.document.body.classList.value = theme;
    this.overlayContainer.getContainerElement().classList.value = 'cdk-overlay-container ' + theme;  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  ngOnInit() {
    // Dirty fix for white background on iOS
    document.body.style.backgroundColor = window.getComputedStyle(this.document.getElementsByClassName('app-frame')[0]).backgroundColor;
  }
}
