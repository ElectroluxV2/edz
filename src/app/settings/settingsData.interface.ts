import { AccountType } from './../services/user.service';
export interface SettingsData {
    userLogin: string;
    userName: string;
    childName?: string;
    userType: AccountType;
}