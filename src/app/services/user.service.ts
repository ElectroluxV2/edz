import { Grade } from './../grades/gradesData.interface';
import { Router, NavigationExtras } from '@angular/router';
import { SwPush } from '@angular/service-worker';
import { Exam, CalendarData, Homework } from './../calendar/calendarData.interface';
import { SettingsData } from './../settings/settingsData.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';
import { environment } from 'src/environments/environment';
import { Md5 } from 'ts-md5/dist/md5';
import { PlanData, Plan, Subject } from '../plan/planData.interface';
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
  protected subjectsUrl = 'https://api.edziennik.ga/subjects';
  protected homeworksUrl = 'https://api.edziennik.ga/homeworks';
  protected examsUrl = 'https://api.edziennik.ga/exams';

  protected plans: PlanData[] = [];
  protected grades: GradesData[] = [];
  protected settings: SettingsData[] = [];
  protected calendar: CalendarData[] = [];

  constructor(private http: HttpClient, readonly swPush: SwPush, private router: Router) {
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
    this.pushHandling();
  }

  public removeNewFromGrade(login: string, lesson: string, grade: Grade) {

    const uIndex = this.users.findIndex(u => u.login === login);

    if (uIndex === -1) {
      console.warn('Missing user with login: '+login);
      return;
    }

    const lIndex = this.users[uIndex].grades.findIndex(l => l.name === lesson);
        
    if (lIndex === -1) {
      console.warn('Missing lesson with name: '+lesson);
      return;
    }

    // Get index of grade
    let gIndex = -1;
    if (grade.period === 1) {
      gIndex = this.users[uIndex].grades[lIndex].primePeriod.findIndex(g => this.sameGrade(g, grade));
    } else {
      gIndex = this.users[uIndex].grades[lIndex].latterPeriod.findIndex(g => this.sameGrade(g, grade));
    }

    if (gIndex === -1) {         
      return;
    }

    // Remove new
    if (grade.period === 1) {
      this.users[uIndex].grades[lIndex].primePeriod[gIndex].new = false;
    } else {
      this.users[uIndex].grades[lIndex].latterPeriod[gIndex].new = false;
    }

  }

  private sameGrade(g1: Grade, g2: Grade): boolean {
    
    if (g1.average !== g2.average) return false;
    if (g1.category !== g2.category) return false;
    if (g1.date !== g2.date) return false;
    if (g1.description !== g2.description) return false;
    if (g1.grade !== g2.grade) return false;
    if (g1.issuer !== g2.issuer) return false;
    if (g1.period !== g2.period) return false;
    if (g1.weight !== g2.weight) return false;

    return true;
  }

  private pushHandling(): void {
    // Handle clicks
    this.swPush.notificationClicks.subscribe(c => {
      // Shitty implementation
      // https://stackoverflow.com/questions/54138763/open-pwa-when-clicking-on-push-notification-handled-by-service-worker-ng7-andr
    });

    // Used to insert data before notification shows
    this.swPush.messages.subscribe((n: {
      notification: {
        actions: [],
        title: string,
        body: string,
        icon: string,
        data: {
          lessonName?: string,
          oldGrade?: Grade,
          newGrade?: Grade,
          login?: string,
        }
      }

    }) => {

      if (!!n.notification.data.lessonName) {

        const uIndex = this.users.findIndex(u => u.login === n.notification.data.login);

        if (uIndex === -1) {
          console.warn('Missing user with login: '+n.notification.data.login);
          return;
        }

        const lIndex = this.users[uIndex].grades.findIndex(l => l.name === n.notification.data.lessonName);
        
        if (lIndex === -1) {
          console.warn('Missing lesson with name: '+n.notification.data.lessonName);
          return;
        }

        if (!!n.notification.data.oldGrade) {
          // Get index of old grade
          let gIndex = -1;
          if (n.notification.data.oldGrade.period === 1) {
            gIndex = this.users[uIndex].grades[lIndex].primePeriod.findIndex(g => this.sameGrade(g, n.notification.data.oldGrade));
          } else {
            gIndex = this.users[uIndex].grades[lIndex].latterPeriod.findIndex(g => this.sameGrade(g, n.notification.data.oldGrade));
          }

          if (gIndex === -1) {         
            console.log('Local copy is missing of grade to remove, gonna just add new one.');
          } else {
            // Remove old one
            if (n.notification.data.oldGrade.period === 1) {
              this.users[uIndex].grades[lIndex].primePeriod.splice(gIndex, 1);
            } else {
              this.users[uIndex].grades[lIndex].latterPeriod.splice(gIndex, 1);
            }
            
            // No need to do changes to grades view data
          }
        }

        let newG = n.notification.data.newGrade;
        newG.new = true;

        // Push new one
        if (n.notification.data.newGrade.period === 1) {
          this.users[uIndex].grades[lIndex].primePeriod.push(newG);
        } else {
          this.users[uIndex].grades[lIndex].latterPeriod.push(newG);
        }

        // No need to do changes to grades view data
        this.users[uIndex].save(); // For offline, and next uses
        console.log('Added one grade to user and saved.');
      } else {
        console.warn('Unsuported notify!');
        console.log(n.notification.data);
      }
    })
  }

  public async enablePush(endpoint: PushSubscription) {

    interface SubscribeResponse {
      statusCode: number;
      data: {
        credentials_id: number;
        push_id: number;
      };
      error: null | {
        type: string;
        description: string;
      };
    };

    for (const user of this.users) {
      this.http.post('https://api.edziennik.ga/subscribe', {
        login: user.login,
        password_md5: user.password_md5,
        subscription: endpoint
      })
      .pipe(takeWhile(() => this.alive))
      .subscribe((response: SubscribeResponse) => {
        console.log(response);
      });
    }
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

  private async getSubjects(user: User): Promise<{ message: string }> {
    return new Promise<{ message: string }>((resolve, reject) => {

      // Response from api
      interface SubjectsResponse {
        statusCode: number;
        data: {
          subjects: Subject[];
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

      this.http.post(this.subjectsUrl, data)
        .pipe(takeWhile(() => this.alive))
        .subscribe((response: SubjectsResponse) => {

          if (response.error) {
            return reject({
              message: response.error.description
            });
          }

          console.log(response);

          // Create Date objects
          for (const subject of response.data.subjects) {
            subject.date = new Date(subject.date);
          }

          // Find plan data index
          const planIndex = this.plans.findIndex((d) => d.userLogin === user.login);

          // Set Subject for each lesson
          for (const lesson of this.plans[planIndex].plan.monday) {
            if (lesson.empty) continue;
            lesson.date = new Date(lesson.date)
            lesson.subject = response.data.subjects.find((s) => {
              return (this.datePartialEquality(s.date, lesson.date) && (s.lesson === lesson.name));
            });

            // Search for eailer subject
            if (!lesson.subject) {
              lesson.subject = response.data.subjects.find((s) => {
                const lastWeek = new Date(lesson.date.getTime() - 7 * 24 * 60 * 60 * 1000);
                return (this.datePartialEquality(s.date, lastWeek) && (s.lesson === lesson.name));
              });
            }

            if (!lesson.subject) {
              lesson.subject = {
                school: 'n/a',
                group: 'n/a',
                season: 'n/a',
                lesson: lesson.name,
                cycle: 'daily',
                date: lesson.date,
                dateEnd: lesson.date,
                dateStart: lesson.date,
                dayInWeekName: 'Poniedziałek',
                value: ''
              }
            }
          }

          for (const lesson of this.plans[planIndex].plan.tuesday) {
            if (lesson.empty) continue;
            lesson.date = new Date(lesson.date)
            lesson.subject = response.data.subjects.find((s) => {
              return (this.datePartialEquality(s.date, lesson.date) && (s.lesson === lesson.name));
            });

            // Search for eailer subject
            if (!lesson.subject) {
              lesson.subject = response.data.subjects.find((s) => {
                const lastWeek = new Date(lesson.date.getTime() - 7 * 24 * 60 * 60 * 1000);
                return (this.datePartialEquality(s.date, lastWeek) && (s.lesson === lesson.name));
              });
            }

            if (!lesson.subject) {
              lesson.subject = {
                school: 'n/a',
                group: 'n/a',
                season: 'n/a',
                lesson: lesson.name,
                cycle: 'daily',
                date: lesson.date,
                dateEnd: lesson.date,
                dateStart: lesson.date,
                dayInWeekName: 'Wtorek',
                value: ''
              }
            }
          }

          for (const lesson of this.plans[planIndex].plan.wednesday) {
            if (lesson.empty) continue;
            lesson.date = new Date(lesson.date)
            lesson.subject = response.data.subjects.find((s) => {
              return (this.datePartialEquality(s.date, lesson.date) && (s.lesson === lesson.name));
            });

            // Search for eailer subject
            if (!lesson.subject) {
              lesson.subject = response.data.subjects.find((s) => {
                const lastWeek = new Date(lesson.date.getTime() - 7 * 24 * 60 * 60 * 1000);
                return (this.datePartialEquality(s.date, lastWeek) && (s.lesson === lesson.name));
              });
            }

            if (!lesson.subject) {
              lesson.subject = {
                school: 'n/a',
                group: 'n/a',
                season: 'n/a',
                lesson: lesson.name,
                cycle: 'daily',
                date: lesson.date,
                dateEnd: lesson.date,
                dateStart: lesson.date,
                dayInWeekName: 'Środa',
                value: ''
              }
            }
          }

          for (const lesson of this.plans[planIndex].plan.thursday) {
            if (lesson.empty) continue;
            lesson.date = new Date(lesson.date)
            lesson.subject = response.data.subjects.find((s) => {
              return (this.datePartialEquality(s.date, lesson.date) && (s.lesson === lesson.name));
            });

            // Search for eailer subject
            if (!lesson.subject) {
              lesson.subject = response.data.subjects.find((s) => {
                const lastWeek = new Date(lesson.date.getTime() - 7 * 24 * 60 * 60 * 1000);
                return (this.datePartialEquality(s.date, lastWeek) && (s.lesson === lesson.name));
              });
            }

            if (!lesson.subject) {
              lesson.subject = {
                school: 'n/a',
                group: 'n/a',
                season: 'n/a',
                lesson: lesson.name,
                cycle: 'daily',
                date: lesson.date,
                dateEnd: lesson.date,
                dateStart: lesson.date,
                dayInWeekName: 'Czwartek',
                value: ''
              }
            }
          }

          for (const lesson of this.plans[planIndex].plan.friday) {
            if (lesson.empty) continue;
            lesson.date = new Date(lesson.date)
            lesson.subject = response.data.subjects.find((s) => {
              return (this.datePartialEquality(s.date, lesson.date) && (s.lesson === lesson.name));
            });

            // Search for eailer subject
            if (!lesson.subject) {
              lesson.subject = response.data.subjects.find((s) => {
                const lastWeek = new Date(lesson.date.getTime() - 7 * 24 * 60 * 60 * 1000);
                return (this.datePartialEquality(s.date, lastWeek) && (s.lesson === lesson.name));
              });
            }

            if (!lesson.subject) {
              lesson.subject = {
                school: 'n/a',
                group: 'n/a',
                season: 'n/a',
                lesson: lesson.name,
                cycle: 'daily',
                date: lesson.date,
                dateEnd: lesson.date,
                dateStart: lesson.date,
                dayInWeekName: 'Piątek',
                value: ''
              }
            }
          }

          console.log(this.plans[planIndex].plan.wednesday);
          
          
          return resolve({ message: 'Downloaded subjects for ' + user.login });
        });
    });
  }

  private datePartialEquality(one: Date, two: Date) {
    return ((one.getDate() === two.getDate()) && (one.getMonth() === two.getMonth()) && (one.getFullYear() === two.getFullYear()));
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

        // MUST BE AFTER GETPLAN
        await this.getSubjects(user).catch((result: { message: string }) => {
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
