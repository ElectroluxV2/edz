import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import {
  MatGridListModule,
  MatCardModule,
  MatMenuModule,
  MatIconModule,
  MatButtonModule,
  MatToolbarModule,
  MatTabsModule,
  MatListModule,
  MatFormFieldModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatRippleModule,
  MatSlideToggleModule,
  MatSelectModule,
  MatExpansionModule,
  MatDialogModule,
} from '@angular/material';
import { LayoutModule } from '@angular/cdk/layout';
import { PlanComponent } from './plan/plan.component';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router';
import { HeaderInterceptor } from './services/headerInterceptor';
import { GuardService } from './services/guardService';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SettingsComponent } from './settings/settings.component';
import { GradesComponent } from './grades/grades.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarDialogComponent } from './calendar/dialog';
import { registerLocaleData } from '@angular/common';
import localePl from '@angular/common/locales/pl';
import localePlExtra from '@angular/common/locales/extra/pl';

registerLocaleData(localePl, 'pl-PL', localePlExtra);


const appRoutes: Routes = [
  { path: '', redirectTo: '/plan', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'grades', component: GradesComponent, canActivate: [GuardService], canDeactivate: [GuardService] },
  { path: 'calendar', component: CalendarComponent, canActivate: [GuardService], canDeactivate: [GuardService] },
  { path: 'settings', component: SettingsComponent, canActivate: [GuardService], canDeactivate: [GuardService] },
  { path: 'plan', component: PlanComponent, canActivate: [GuardService], canDeactivate: [GuardService] },
  { path: '*', redirectTo: '' },
];


@NgModule({
  declarations: [
    AppComponent,
    PlanComponent,
    LoginComponent,
    SettingsComponent,
    GradesComponent,
    CalendarComponent,
    CalendarDialogComponent
  ],
  entryComponents: [
    CalendarDialogComponent
  ],
  imports: [
    MatSlideToggleModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    LayoutModule,
    MatTabsModule,
    MatToolbarModule,
    MatListModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRippleModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  providers: [
    GuardService,
    { provide: HTTP_INTERCEPTORS, useClass: HeaderInterceptor, multi: true }
],
  bootstrap: [AppComponent]
})

export class AppModule { }
