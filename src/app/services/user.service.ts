import { Exam, CalendarData, Homework } from './../calendar/calendarData.interface';
import { SettingsData } from './../settings/settingsData.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy, HostListener } from '@angular/core';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5/dist/md5';
import { PlanData, Plan } from '../plan/planData.interface';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { GradesData, GradeLesson } from '../grades/gradesData.interface';

export enum AccountType {
  parent = 'parent',
  child = 'child',
}

export class User {
  password_md5: string;
  login: string;
  accountType: AccountType;
  lastUpdate: Date;
  userName: string;
  school: string | null;
  name: string | null;
  surname: string | null;
  child: null | {
    login: string;
    name: string;
    surname: string;
    school: string;
  };
  public plan: Plan;
  public grades: GradeLesson[];
  public exams: Exam[];
  public homeworks: Homework[];

  constructor(login: string, password_md5: string) {
    this.login = login;
    this.password_md5 = password_md5;
  }

  save() {
    const json = JSON.stringify({
      login: this.login,
      password_md5: this.password_md5,
      accountType: this.accountType,
      lastUpdate: this.lastUpdate,
      userName: this.userName,
      school: this.school,
      name: this.name,
      surname: this.surname,
      child: this.child,
      plan: this.plan,
      grades: this.grades,
      exams: this.exams,
      homeworks: this.homeworks,
    });    

    const md5 = new Md5();
    const hash: string = md5.appendStr(this.login).end().toString();

    localStorage.setItem('user-' + hash, json);
  }
}

@Injectable({
  providedIn: 'root'
})
export class UserService implements OnDestroy {
  protected alive = true;
  protected users: User[] = [];
  protected loginUrl = 'https://api.edziennik.ga/login';
  protected gradesUrl = 'https://api.edziennik.ga/grades';
  protected planUrl = 'https://api.edziennik.ga/lessonPlan';
  protected homeworksUrl = 'https://api.edziennik.ga/homeworks';
  protected examsUrl = 'https://api.edziennik.ga/exams';

  protected plans: PlanData[] = [];
  protected grades: GradesData[] = [];
  protected settings: SettingsData[] = [];
  protected calendar: CalendarData[] = [];

  constructor(private http: HttpClient) {
    console.log('User service');
    // Load users

    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('user-')) {
        const json = localStorage.getItem(key);
        const saved = JSON.parse(json) as User;

        // Add this user data
        let name: string;
        if (saved.accountType === AccountType.parent) {
          name = saved.child.name;
        } else {
          name = saved.name;
        }

        this.plans.push({
          userLogin: saved.login,
          userName: name,
          plan: saved.plan,
        });

        this.grades.push({
          userLogin: saved.login,
          userName: name,
          grades: saved.grades,
        });

        this.settings.push({
          userLogin: saved.login,
          userName: saved.userName,
          childName: (saved.child) ? (saved.child.name) : (null),
          userType: saved.accountType,
        });

        this.calendar.push({
          userLogin: saved.login,
          userName: name,
          exams: saved.exams,
          homeworks: saved.homeworks,
        });
        
        // We need to use native constructor
        const user = new User(saved.login, saved.password_md5);
        Object.assign(user, saved);
        this.users.push(user);
      }
    }

    //this.testReactive(1, 'up');
  }

  get lastSync(): Date {
    return new Date(localStorage.getItem('lastSync'));
  }

  set lastSync(date: Date) {
    localStorage.setItem('lastSync', date.toString());
  }

  private testReactive(times: number, way: string) {

    if (way === 'up') {
      this.settings.push({
        userLogin: 'L: '+times,
        userName: 'N: '+times,
        childName: (times%2==0) ? ('Child') : (null),
        userType: (times%2==0) ? AccountType.parent : AccountType. child,
      });
      if (this.settings.length == 5) way = 'down';
    } else {
      if (this.settings.length == 2) way = 'up';
      this.settings.pop();
    }

    setTimeout(() => { this.testReactive(++times, way) }, 50);
    
  }

  get planData(): Observable<PlanData[]> {
    return of(this.plans);
  }

  get gradesData(): Observable<GradesData[]> {
    return of(this.grades);
  }

  get settingsData(): Observable<SettingsData[]> {
    return of(this.settings);
  }

  get calendarData(): Observable<CalendarData[]> {
    return of(this.calendar);
  }

  get isAnyoneLoggedIn(): Boolean {
    return (this.users.length > 0);
  }

  public deleteUser(login: string): void {
    // Remove from memory
    if (this.users.some(u => u.login === login)) {
      this.users.splice(this.users.findIndex(u => u.login === login), 1);
    }
    // Remove from data
    if (this.settings.some(u => u.userLogin === login)) {
      this.settings.splice(this.settings.findIndex(u => u.userLogin === login), 1);
    }
    if (this.plans.some(u => u.userLogin === login)) {
      this.plans.splice(this.plans.findIndex(u => u.userLogin === login), 1);
    }
    if (this.grades.some(u => u.userLogin === login)) {
      this.grades.splice(this.grades.findIndex(u => u.userLogin === login), 1);
    }
    // Remove from storage
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.includes('user-')) {
        const json = localStorage.getItem(key);
        const saved = JSON.parse(json) as User;
        if (saved.login === login) {
          localStorage.removeItem(key);
          return;
        }
      }
    }
    console.log(this.users);
    
  }

  private async getPlan(user: User): Promise<{ message: string }> {
    return new Promise<{ message: string }>((resolve, reject) => {

      // Response from api
      interface PlanResponse {
        statusCode: number;
        data: {
          plan: Plan;
        };
        error: null | {
          type: string;
          description: string;
        };
      }

      const data: any = {
        login: user.login,
        password_md5: user.password_md5
      };

      if (user.accountType === AccountType.parent) {
        data.child = user.child.login;
      }

      this.http.post(this.planUrl, data)
        .pipe(takeWhile(() => this.alive))
        .subscribe((response: PlanResponse) => {

          if (response.error) {
            return reject({
              message: response.error.description
            });
          }

          user.plan = response.data.plan;

          // Add this user data only if there is no such user, otherwise set data for this user
          if (this.plans.some(d => d.userLogin === user.login)) {
            this.plans.find(d => d.userLogin === user.login).plan = user.plan;
          } else {
            let name: string;
            if (user.accountType === AccountType.parent) {
              name = user.child.name;
            } else {
              name = user.name;
            }

            this.plans.push({
              userLogin: user.login,
              userName: name,
              plan: user.plan,
            });
          }

          return resolve({ message: 'Downloaded plan for ' + user.login });
        });
    });
  }

  private async getGrades(user: User): Promise<{ message: string }> {
    return new Promise<{ message: string }>((resolve, reject) => {

      // Response from api
      interface GradesResponse {
        statusCode: number;
        data: {
          grades: GradeLesson[];
        };
        error: null | {
          type: string;
          description: string;
        };
      }

      const data: any = {
        login: user.login,
        password_md5: user.password_md5
      };

      if (user.accountType === AccountType.parent) {
        data.child = user.child.login;
      }

      this.http.post(this.gradesUrl, data)
        .pipe(takeWhile(() => this.alive))
        .subscribe((response: GradesResponse) => {

          if (response.error) {
            return reject({
              message: response.error.description
            });
          }

          user.grades = response.data.grades;

          // Add this user data only if there is no such user, otherwise set data for this user
          if (this.grades.some(d => d.userLogin === user.login)) {
            this.grades.find(d => d.userLogin === user.login).grades = user.grades;
          } else {
            let name: string;
            if (user.accountType === AccountType.parent) {
              name = user.child.name;
            } else {
              name = user.name;
            }

            this.grades.push({
              userLogin: user.login,
              userName: name,
              grades: user.grades,
            });
          }

          return resolve({ message: 'Downloaded grades for ' + user.login });
        });
    });
  }

  private async getExams(user: User): Promise<{ message: string }> {
    return new Promise<{ message: string }>((resolve, reject) => {

      // Response from api
      interface ExamsResponse {
        statusCode: number;
        data: {
          exams: Exam[];
        };
        error: null | {
          type: string;
          description: string;
        };
      }

      const data: any = {
        login: user.login,
        password_md5: user.password_md5
      };

      this.http.post(this.examsUrl, data)
        .pipe(takeWhile(() => this.alive))
        .subscribe((response: ExamsResponse) => {

          if (response.error) {
            return reject({
              message: response.error.description
            });
          }

          user.exams = response.data.exams;

          // Add this user data only if there is no such user, otherwise set data for this user
          if (this.calendar.some(d => d.userLogin === user.login)) {
            this.calendar.find(d => d.userLogin === user.login).exams = user.exams;
          } else {
            let name: string;
            if (user.accountType === AccountType.parent) {
              name = user.child.name;
            } else {
              name = user.name;
            }

            this.calendar.push({
              userLogin: user.login,
              userName: name,
              exams: user.exams,
              homeworks: user.homeworks ? user.homeworks : [],
            });
          }

          return resolve({ message: 'Downloaded exams for ' + user.login });
        });
    });
  }

  private async getHomeworks(user: User): Promise<{ message: string }> {
    return new Promise<{ message: string }>((resolve, reject) => {

      // Response from api
      interface HomeworksResponse {
        statusCode: number;
        data: {
          homeworks: Homework[];
        };
        error: null | {
          type: string;
          description: string;
        };
      }

      const data: any = {
        login: user.login,
        password_md5: user.password_md5
      };

      this.http.post(this.homeworksUrl, data)
        .pipe(takeWhile(() => this.alive))
        .subscribe((response: HomeworksResponse) => {

          if (response.error) {
            return reject({
              message: response.error.description
            });
          }

          user.homeworks = response.data.homeworks;

          // Add this user data only if there is no such user, otherwise set data for this user
          if (this.calendar.some(d => d.userLogin === user.login)) {
            this.calendar.find(d => d.userLogin === user.login).homeworks = user.homeworks;
          } else {
            let name: string;
            if (user.accountType === AccountType.parent) {
              name = user.child.name;
            } else {
              name = user.name;
            }

            this.calendar.push({
              userLogin: user.login,
              userName: name,
              homeworks: user.homeworks,
              exams: user.exams ? user.exams : [],
            });
          }

          return resolve({ message: 'Downloaded homeworks for ' + user.login });
        });
    });
  }

  public async sync(options: {
      onlyLatestUser: boolean;
    } = {
      onlyLatestUser: false
    }): Promise<{ message: string }> {

    return new Promise<{ message: string }>(async (resolve, reject) => {
      const startIndex = (options.onlyLatestUser) ? (this.users.length - 1) : (0);
      for await (const user of this.users.slice(startIndex)) {

        if (!environment.production) {
          console.time('sync');
          console.timeLog('sync', 'Selected user ' + user.login);
        }

        await this.getPlan(user).catch((result: { message: string }) => {
          return reject({
            message: result.message
          });
        }).then((result: { message: string }) => {
          if (!environment.production) {
            console.timeLog('sync', result.message);
          }
        });

        await this.getGrades(user).catch((result: { message: string }) => {
          return reject({
            message: result.message
          });
        }).then((result: { message: string }) => {
          if (!environment.production) {
            console.timeLog('sync', result.message);
          }
        });

        await this.getExams(user).catch((result: { message: string }) => {
          return reject({
            message: result.message
          });
        }).then((result: { message: string }) => {
          if (!environment.production) {
            console.timeLog('sync', result.message);
          }
        });

        await this.getHomeworks(user).catch((result: { message: string }) => {
          return reject({
            message: result.message
          });
        }).then((result: { message: string }) => {
          if (!environment.production) {
            console.timeLog('sync', result.message);
          }
        });

        // Save to memory and update observers
        user.save();
      }

      if (!environment.production) {
        console.timeEnd('sync');
      }

      this.lastSync = new Date();

      resolve();
    });
  }

  public async login(login: string, password: string): Promise<{ message: string }> {
    return new Promise<{ message: string }>((resolve, reject) => {
      for (const user of this.users) {
        if (user.login === login) {
          return reject({
            message: 'To konto już jest zalogowane'
          });
        }
      }

      // Response from api
      interface LoginResponse {
        statusCode: number;
        data: {
          userName: string;
          accountType: AccountType;
          lastUpdate: Date;
          school: string | null;
          name: string | null;
          surname: string | null;
          login: string;
          child: null | {
            login: string;
            name: string;
            surname: string;
            school: string;
          };
        };
        error: null | {
          type: string;
          description: string;
        };
      }
      const md5 = new Md5();
      const password_md5: string = md5.appendStr(password).end().toString();

      this.http.post(this.loginUrl, { login, password_md5 })
        .pipe(takeWhile(() => this.alive))
        .subscribe((response: LoginResponse) => {
          if (response.error) {
            return reject({
              message: response.error.description
            });
          }

          // Create new user with gained data
          const user = new User(login, password_md5);
          const data = response.data as User;
          Object.assign(user, data);

          this.settings.push({
            userLogin: user.login,
            userName: user.userName,
            childName: (user.child) ? (user.child.name) : (null),
            userType: user.accountType,
          });

          // DO NOT SAVE BEFORE SYNC
          this.users.push(user);
          return resolve({ message: 'Logged in!' });
        });
    });
  }

  ngOnDestroy(): void {
    this.alive = false;    
  }
}
