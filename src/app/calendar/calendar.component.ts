import { Component, OnDestroy } from '@angular/core';
import { User, UserService } from '../services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { CalendarDialogComponent } from './dialog';
import { takeWhile } from 'rxjs/internal/operators/takeWhile';


interface Month {
  text: string;
  days: Day[];
}

interface Day {
  disabled: boolean;
  highlight: boolean;
  current: boolean;
  text: string;
  date: Date;
}

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnDestroy {
  alive = true;
  users: User[] = [];
  months: Month[] = [];

  constructor(private userService: UserService, public dialog: MatDialog) {/*
    this.userService.getUsers()
    .pipe(takeWhile(() => this.alive))
    .subscribe( users => {
      this.users = users as User[];
    });

    // Array to ONLY mark dates
    const highlightDates: Date[] = [];
    for (const user of this.users) {
      for (const exam of user.data.calendar.exams) {
        const date = new Date(exam.dateEnd);
        highlightDates.push(date);
      }
      for (const homework of user.data.calendar.homeworks) {
        const date = new Date(homework.dateEnd);
        highlightDates.push(date);
      }
    }

    const now = new Date();
    const startYear = (now.getMonth() < 8) ? (now.getFullYear() - 1) : now.getFullYear();
    const startDate = new Date(startYear, 8);
    const endDate = new Date(startYear + 1, 6);

    const formatter = new Intl.DateTimeFormat('pl', {
      month: 'long'
    });

    for (let dayInLoop = startDate, lastMonth = startDate.getMonth() - 1, monthIndex = -1;
      dayInLoop < endDate;
      dayInLoop.setDate(dayInLoop.getDate() + 1)) {

      if (lastMonth !== dayInLoop.getMonth()) {
        lastMonth = dayInLoop.getMonth();

        this.months.push({
          text: formatter.format(dayInLoop) + ' ' + dayInLoop.getFullYear(),
          days: []
        });
        monthIndex++;

        // Add empty days on the front on every month
        if (dayInLoop.getDay() !== 7) {
          for (let i = 0; i !== dayInLoop.getDay(); i++) {
            this.months[monthIndex].days.push({
              text: ' ',
              disabled: true,
              highlight: false,
              current: false,
              date: null
            });
          }
        }
      }

      let thl = false;

      // Now add events
      for (const date of highlightDates) {
        if (this.datePartialEquality(date, dayInLoop)) {
          thl = true;
        }
      }

      this.months[monthIndex].days.push({
        text: dayInLoop.getDate() + '',
        highlight: thl,
        disabled: ((dayInLoop.getDay() === 0) || (dayInLoop.getDay() === 6)),
        current: this.datePartialEquality(dayInLoop, now),
        date: thl ? new Date(dayInLoop) : null
      });
    }*/
  }

  show(toFind: Date) {/*
    if (toFind === null) {
      return;
    }

    const homeworks: Homework[] = [];
    const exams: Exam[] = [];

    for (const user of this.users) {
      for (const exam of user.data.calendar.exams) {
        const date = new Date(exam.dateEnd);

        if (this.datePartialEquality(toFind, date)) {
          exams.push(exam);
        }
      }
      for (const homework of user.data.calendar.homeworks) {
        const date = new Date(homework.dateEnd);

        if (this.datePartialEquality(toFind, date)) {
          homeworks.push(homework);
        }
      }
    }

    const dialogRef = this.dialog.open(CalendarDialogComponent, {
      data: {
        date: toFind,
        exams,
        homeworks
      }
    });*/
  }

  private datePartialEquality(one: Date, two: Date) {
    return ((one.getDate() === two.getDate()) && (one.getMonth() === two.getMonth()) && (one.getFullYear() === two.getFullYear()));
  }

  ngOnDestroy(): void {
    this.alive = false;
  }
}
