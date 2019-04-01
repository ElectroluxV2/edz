import { Component, OnInit, ViewChild } from '@angular/core';
import { UserService, UserCredentials } from '../services/user.service';
import { HttpClient } from '@angular/common/http';
import { Plan } from '../plan/plan';
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


  constructor(private userService: UserService, private router: Router) {
    console.log('login component');
  }

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
      Swal.hideLoading();
      this.loading = false;
      this.router.navigate(['plan']);
      Swal.fire({
        title: 'Kim jestes?',
        text: 'Zalogowano!',
        type: 'success',
        allowOutsideClick: true,
      });
    }).catch(result => {
      this.loading = false;
      Swal.hideLoading();
      Swal.showValidationMessage(result.message);
    });
    return;
  }
}
