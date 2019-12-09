export interface Exam {
    school: string;
    group: string;
    category: string;
    type: string;
    loaction: string;
    lesson: string;
    subject: string;
    target: string;
    info: string;
    dateStart: Date;
    dateEnd: Date;
    dateAdded: string;
    issuer: string;
}

export interface Homework {
    school: string;
    group: string;
    lesson: string;
    info: string;
    dateEnd: Date;
}

export interface CalendarData {
    userName: string;
    userLogin: string;
    exams: Exam[];
    homeworks: Homework[];
}