import { Component, ViewChild, ElementRef } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent {
  hide: boolean;
  login: string;
  password: string;
  loginError = false;
  passwordError = false;
  loading = false;
  @ViewChild('lpt', {static: false}) lpt: ElementRef;
  @ViewChild('ppt', {static: false}) ppt: ElementRef;

  constructor(private userService: UserService, private router: Router) { }

  tryLogin(): void {

    this.loginError = false;
    this.passwordError = false;

    if (!this.login) {
      this.loginError = true;
    }

    if (!this.password) {
      this.passwordError = true;
    }

    if (this.passwordError || this.loginError) {

      this.lpt.nativeElement.focus();
      this.ppt.nativeElement.focus();
      this.ppt.nativeElement.blur();
      return;
    }

    Swal.fire({
      title: 'Kim jesteś?',
      text: 'Weryfikujemy twoją tożsamość',
      type: 'question',
      allowOutsideClick: false,
    });

    this.loading = true;
    Swal.showLoading();

    this.userService.login(this.login, this.password).then(() => {

      Swal.fire({
        title: 'Już wiemy kim jesteś!',
        html: 'Teraz pobieramy twoje dane<br><s>żeby cię okraść</s>.',
        type: 'info',
        allowOutsideClick: false,
      });
      Swal.showLoading();

      this.userService.sync({
        onlyLatestUser: true,
      }).then(() => {

        Swal.fire({
          title: 'Już za późno.',
          text: 'Zalogowano!',
          type: 'success',
          allowOutsideClick: false,
        }).then(() => {
          this.router.navigate(['plan']);
        });

      }).catch((result: { message: string; }) => {
        this.loading = false;
        Swal.hideLoading();
        Swal.showValidationMessage(result.message);
      });

    }).catch((result: { message: string; }) => {
      this.loading = false;
      Swal.hideLoading();
      Swal.showValidationMessage(result.message);
    });
  }

  get addMargin(): Boolean {
    return this.userService.isAnyoneLoggedIn;
  }
}
