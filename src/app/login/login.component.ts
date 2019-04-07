import { Component, OnInit } from '@angular/core';
import { UserService } from '../services/user.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [UserService]
})

export class LoginComponent implements OnInit {
  hide: boolean;
  login: string;
  password: string;
  code: string;
  loginError = false;
  passwordError = false;
  codeError = false;
  loading = false;


  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {

  }

  tryLogin() {

    if ((!this.login)) {
      this.loginError = true;
    }

    if ((!this.password)) {
      this.passwordError = true;
    }

    if ((this.passwordError) || (this.loginError)) {
      this.passwordError = false;
      this.loginError = false;
      return;
    }

    Swal.fire({
      title: 'Kim jestes?',
      text: 'Weryfikujemy twoją tożsamość',
      type: 'question',
      allowOutsideClick: false,
    });
    this.loading = true;
    Swal.showLoading();

    this.userService.loginUser(this.login, this.password, this.code).then(result => {
      Swal.fire({
        title: 'Już wiemy kim jesteś',
        text: 'Teraz pobieramy Twoje dane żeby cię okraść',
        type: 'info',
        allowOutsideClick: false,
      });
      Swal.showLoading();
      // Now sync
      // Get data for all
      this.userService.synchronization().then(() => {
        Swal.hideLoading();
        Swal.fire({
          title: 'Już za pózno',
          text: 'Zalogowano!',
          type: 'success',
          allowOutsideClick: true,
        }).then(() => {
          this.loading = false;
          this.router.navigate(['plan']);
        });
      }).catch((message) => {
        this.loading = false;
        Swal.hideLoading();
        Swal.showValidationMessage(message);
      });
    }).catch(result => {
      this.loading = false;
      Swal.hideLoading();
      Swal.showValidationMessage(result.message);
    });
    return;
  }
}
