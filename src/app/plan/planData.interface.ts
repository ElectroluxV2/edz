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

export interface PlanData {
    userName: string;
    userLogin: string;
    plan: Plan;
}