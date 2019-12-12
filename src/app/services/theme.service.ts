import { Injectable } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { Meta } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  constructor(private overlayContainer: OverlayContainer, private meta: Meta) {    
    console.log('Theme service');
  }

  get currentTheme(): string {
    return localStorage.getItem('theme');
  }

  public changeTheme(name: string) {
    // Override
    document.body.classList.value = name;
    this.overlayContainer.getContainerElement().classList.value = 'cdk-overlay-container ' + name;

    // Dirty fix for white background on iOS
    const rgb = window.getComputedStyle(document.getElementsByClassName('app-frame')[0]).backgroundColor;
    document.body.style.backgroundColor = rgb;
    document.documentElement.style.backgroundColor = rgb;
    const hexColor = '#' + rgb.substr(4, rgb.indexOf(')') - 4).split(',').map((color) => String("0" + parseInt(color).toString(16)).slice(-2)).join('');
     
    // Change status bar color
    this.meta.updateTag({name: 'theme-color', content: hexColor});

    // Save
    localStorage.setItem('theme', name);
  }

  public load(): void {
    const theme = localStorage.getItem('theme');
    this.changeTheme(theme);
  }
}
