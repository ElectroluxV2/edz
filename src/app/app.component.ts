import { UserService } from './services/user.service';
import { ThemeService } from './services/theme.service';
import { Component, OnInit } from '@angular/core';
import { UpdateService } from './services/update.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  constructor(private updateService: UpdateService, private userService: UserService, private themeService: ThemeService) {
    this.updateService.checkForUpdates();
  }

  get showMenu(): Boolean {
    return this.userService.isAnyoneLoggedIn;
  }

  ngOnInit(): void {
    this.themeService.load();
  }
}
