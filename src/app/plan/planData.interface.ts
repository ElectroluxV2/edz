export interface Subject {
    school: string;
    group: string;
    season: string;
    lesson: string;
    cycle: 'weekly' | 'daily';
    date: Date;
    dateStart: Date;
    dateEnd: Date;
    dayInWeekName: string;
    value: string;
}

export interface Lesson {
    name: string;
    time: string;
    teacher: string;
    empty: boolean;
    subject: Subject;
    date: Date;
}
  
export interface Plan {
    monday: Lesson[];
    tuesday: Lesson[];
    wednesday: Lesson[];
    thursday: Lesson[];
    friday: Lesson[];
}

export interface PlanData {
    userName: string;
    userLogin: string;
    plan: Plan;
}