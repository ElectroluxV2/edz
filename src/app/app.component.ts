import { Component, Inject } from '@angular/core';
import { UpdateService } from './services/update.service';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { interval } from 'rxjs';
import { nextContext } from '@angular/core/src/render3';
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
              private router: Router,
              private overlayContainer: OverlayContainer,
              @Inject(DOCUMENT) private document: Document) {
    this.update.checkForUpdates();

    if (this.userService.isLoggedIn()) {
      this.router.navigate(['plan']);
    } else {
      this.router.navigate(['login']);
    }

    const theme = localStorage.getItem('theme');

    // Override
    this.document.body.classList.value = theme;
    this.overlayContainer.getContainerElement().classList.value = 'cdk-overlay-container ' + theme;
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  ngOnInit() {
    // Dirty fix for white background on iOS
    document.body.style.backgroundColor = window.getComputedStyle(this.document.getElementsByClassName('app-frame')[0]).backgroundColor;
  }
}
