import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Md5 } from 'ts-md5/dist/md5';

export interface UserSettings {
  syncInterval: number;
  syncState: boolean;
  theme: string;
}

export interface Lesson {
  name: string;
  time: string;
  teacher: string;
  empty: boolean;
}

export interface Plan {
  monday: Lesson[];
  tuesday: Lesson[];
  wednesday: Lesson[];
  thursday: Lesson[];
  friday: Lesson[];
}

export interface UserData {
  plan: Plan;
}

export class User {
  password: string; // MD5
  login: string;
  authentication: string;
  public settings: UserSettings;
  public data: UserData;

  constructor(
      login: string = '',
      password: string = '',
      authentication: string = '',
      settings: UserSettings = null,
      data: UserData = null) {

    this.login = login;
    this.password = password;
    this.authentication = authentication;
    this.settings = settings === null ? {} as UserSettings : settings;
    this.data = data === null ? {} as UserData : data;
  }

  save() {
    const json = JSON.stringify({
      login: this.login,
      password: this.password,
      authentication: this.authentication,
      settings: this.settings,
      data: this.data
    });

    localStorage.setItem('user-' + this.login, json);
  }
}

@Injectable({
  providedIn: 'root'
})

export class UserService {

  users: User[] = [];
  loginUrl = 'https://edz.budziszm.pro-linuxpl.com/api.php/login';
  planUrl = 'https://edz.budziszm.pro-linuxpl.com/api.php/plan';
  constructor(private http: HttpClient) { }

  loadSavedUsers() {
    // Load saved users
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('user-')) {
        const user: User = JSON.parse(localStorage.getItem(key));
        console.log(user);

        this.users.push(user);
      }
    }
  }

  // Return true if any user is logged in
  isLoggedIn() {
    // Load users
    this.loadSavedUsers();
    return (this.users.length) ? true : false;
  }

  loginUser(login: string, password: string, code: string) {
    return new Promise((resolve, reject) => {

      // Response from api
      interface LoginResponse {
        status: string;
        code: number;
        message: string;
      }

      // For headerInterceptor
      localStorage.setItem('token',  btoa(login + ':' + code));

      const md5 = new Md5();
      const md5pass: string = md5.appendStr(password).end().toString();

      this.http.post(this.loginUrl, { login, pass: md5pass }).subscribe((result: LoginResponse) => {
        // Remove token
        if (result.code === 1) {
          localStorage.removeItem('token');
          console.log('Removed token entry from localStorage');
          reject(result);
        }

        if (result.code === 2) {
          reject(result);
        }
        // Create new user
        const newUser: User = new User(login, md5pass, btoa(login + ':' + code));

        // Save
        newUser.save();

        // Add user to array
        this.users.push(newUser);
        // Get data for all users
        this.synchronization();
        resolve(result);
      });
    });
  }

  synchronization() {
    this.getPlan().then(() => {
      console.log('Plan synchronization completed');
    }).catch((message) => {
      console.warn(message);
    });
  }

  private getPlan() {
    this.loadSavedUsers();
    return new Promise((resolve, reject) => {

      if (this.users.length === 0) {
        console.warn('Trying to get plan without user!');
        reject('No logged in accounts');
        return;
      }

       // Response from api
      interface PlanResponse {
        status: string;
        code: number;
        message: string;
        plan: Plan;
      }

      // Sync for all users
      for (const user of this.users) {

        console.log('Synchronizations started for ' + user.login);
        // For headerInterceptor.ts
        localStorage.setItem('token', user.authentication);

        this.http.post(this.planUrl, { login: user.login, pass: user.password }).subscribe((result: PlanResponse) => {
          if (result.code !== 3) {
            reject(result.message);
          } else {
            // Save
            user.data.plan = result.plan;
            user.save();
            console.log('Successfully synced plan for ' + user.login);
          }
        });
      }
      resolve();
    });
  }
}
