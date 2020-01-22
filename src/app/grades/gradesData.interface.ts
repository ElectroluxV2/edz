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
    new?: boolean;
}
  
export interface GradeLesson {
    name: string;
    primePeriod: Grade[];
    latterPeriod: Grade[];
}

export interface GradesData {
    userName: string;
    userLogin: string;
    grades: GradeLesson[];
}