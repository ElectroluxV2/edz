import { Component } from '@angular/core';
import { UpdateService } from './services/update.service';
import { UserService } from './services/user.service';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { interval } from 'rxjs';
import { nextContext } from '@angular/core/src/render3';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent {
  title = 'EDZ';
  logged = true;
  active = 2;
  themes = [
    'blackngray',
    'kn-red',
    'kn-green-1',
    'kn-green-2',
    'kn-green-3',
    'kn-purple-13'
  ];
  current = 0;
  theme = 'kn-purple-13';

  next() {
    this.current++;
    this.overlayContainer.getContainerElement().classList.remove(this.theme);
    this.theme = this.themes[this.current];
    this.overlayContainer.getContainerElement().classList.add(this.theme);
    if (this.current === this.themes.length - 1) {
      this.current = -1;
    }
  }

  constructor(private update: UpdateService,
              private userService: UserService,
              private router: Router,
              private overlayContainer: OverlayContainer) {
    this.update.checkForUpdates();

    if (this.userService.isLoggedIn()) {
      this.router.navigate(['settings']);
    } else {
      this.router.navigate(['login']);
    }

    overlayContainer.getContainerElement().classList.add(this.theme);
  }

  isLoggedIn() {
    return this.userService.isLoggedIn();
  }

  ngOnInit() { }
}
