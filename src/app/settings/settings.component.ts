import { Component, OnInit, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.sass']
})
export class SettingsComponent implements OnInit {

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

  constructor(@Inject(DOCUMENT) private document: Document, private overlayContainer: OverlayContainer) {
    this.themeSelected = localStorage.getItem('theme');
    this.syncState = (localStorage.getItem('syncState') === 'true');
    this.syncInterval = localStorage.getItem('syncInterval');
  }

  ngOnInit() { }
}
