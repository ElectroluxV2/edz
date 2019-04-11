import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Md5 } from 'ts-md5/dist/md5';
import { Observable, of } from 'rxjs';

export interface UserSettings {
  syncInterval: number;
  syncState: boolean;
  theme: string;
}

export interface Exam {
  school: string;
  group: string;
  category: string;
  type: string;
  location: string;
  lesson: string;
  subject: string;
  target: string;
  info: string;
  dateStart: string;
  dateEnd: string;
  dateAdded: string;
  issuer: string;
}

export interface Homework {
  school: string;
  group: string;
  lesson: string;
  info: string;
  dateEnd: string;
}

export interface Calendar {
  exams: Exam[];
  homeworks: Homework[];
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

export interface Grade {
  category: string;
  grade: string;
  value: string;
  weight: number;
  period: number;
  average: boolean;
  individual: boolean;
  description: string;
  date: string;
  issuer: string;
}

export interface GradeLesson {
  name: string;
  grades: Grade[];
}

export interface UserData {
  plan: Plan;
  grades: GradeLesson[];
  calendar: Calendar;
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
    if (data === null) {
      this.data = {} as UserData;
      this.data.plan = {} as Plan;
    } else {
      this.data = data;
    }
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
  gradesUrl = 'https://edz.budziszm.pro-linuxpl.com/api.php/grades';
  calendarUrl = 'https://edz.budziszm.pro-linuxpl.com/api.php/calendar';
  constructor(private http: HttpClient) {
    this.loadSavedUsers();
  }

  getUsers(): Observable<User[]> {
    // Required by multi instance
    this.loadSavedUsers();
    return of(this.users);
  }

  loadSavedUsers() {
    // Load saved users
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('user-')) {
        const saved: User = JSON.parse(localStorage.getItem(key));

        // Force to use constructor
        const newUser = new User(saved.login, saved.password, saved.authentication, saved.settings, saved.data);

        let add = true;
        for (let u of this.users) {
          if (u.login === newUser.login) {
            // Set
            u = newUser;
            add = false;
            break;
          }
        }

        if (add) {
          this.users.push(newUser);
        }
      }
    }
  }

  // Return true if any user is logged in
  isLoggedIn() {
    this.loadSavedUsers(); // Can run in multiple instances
    return (this.users.length) ? true : false;
  }

  deleteUser(login: string) {
    // Load users
    this.loadSavedUsers();
    // Remove from memory
    for (let i = 0; i < this.users.length; i++) {
      if (this.users[i].login === login) {
        this.users.splice(i, 1);
      }
    }
    // Remove from storage
    localStorage.removeItem('user-' + login);
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
        // DO NOT SAVE BEFORE SYNC
        // newUser.save();
        // Add user to array
        this.users.push(newUser);
        resolve();
      });
    });
  }

  async synchronization() {
    // Load from another instances
    this.loadSavedUsers();

    if (this.users.length === 0) {
      console.warn('Trying to sync without user!');
      return false;
    }

    const res1 = await this.getPlan().catch(() => {
      return false;
    });

    const res2 = await this.getGrades().catch(() => {
      return false;
    });

    const res3 = await this.getCalendar().catch(() => {
      return false;
    });

    // Save for other instances
    for (const user of this.users) {
      user.save();
    }

    return true;
  }

  private getCalendar() {
    return new Promise((resolve, reject) => {

      interface CalendarResponse {
        status: string;
        code: number;
        message: string;
        calendar: Calendar;
      }

      // Sync for all users
      for (let i = 0; i < this.users.length; i++) {
        // For headerInterceptor.ts
        localStorage.setItem('token', this.users[i].authentication);
        this.http.post(this.calendarUrl, { login: this.users[i].login, pass: this.users[i].password }).subscribe((result: CalendarResponse) => {
          if (result.code !== 3) {
            reject(result.message);
          } else {
            // Save
            this.users[i].data.calendar = result.calendar;
            console.log('Successfully synced calendar for ' + this.users[i].login);
            if (i === this.users.length - 1) {
              resolve();
            }
          }
        });
      }
    });
  }


  private getGrades() {
    return new Promise((resolve, reject) => {

      interface GradesResponse {
        status: string;
        code: number;
        message: string;
        grades: GradeLesson[];
      }

      // Sync for all users
      for (let i = 0; i < this.users.length; i++) {
        // For headerInterceptor.ts
        localStorage.setItem('token', this.users[i].authentication);
        this.http.post(this.gradesUrl, { login: this.users[i].login, pass: this.users[i].password }).subscribe((result: GradesResponse) => {
          if (result.code !== 3) {
            reject(result.message);
          } else {
            // Save
            this.users[i].data.grades = result.grades;
            console.log('Successfully synced grades for ' + this.users[i].login);
            if (i === this.users.length - 1) {
              resolve();
            }
          }
        });
      }
    });
  }

  private getPlan() {
    return new Promise((resolve, reject) => {

       // Response from api
      interface PlanResponse {
        status: string;
        code: number;
        message: string;
        plan: Plan;
      }

      // Sync for all users
      for (let i = 0; i < this.users.length; i++) {

        // console.log('Synchronizations started for ' + user.login);
        // For headerInterceptor.ts
        localStorage.setItem('token', this.users[i].authentication);

        this.http.post(this.planUrl, { login: this.users[i].login, pass: this.users[i].password }).subscribe((result: PlanResponse) => {
          if (result.code !== 3) {
            reject(result.message);
          } else {
            // Save
            this.users[i].data.plan = result.plan;
            console.log('Successfully synced plan for ' + this.users[i].login);
            if (i === this.users.length - 1) {
              resolve();
            }
          }
        });
      }
    });
  }
}
