import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatRippleModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { LayoutModule } from '@angular/cdk/layout';
import { PlanComponent } from './plan/plan.component';
import { LoginComponent } from './login/login.component';
import { Routes, RouterModule } from '@angular/router';
import { HeaderInterceptor } from './services/headerInterceptor';
import { GuardService } from './services/guardService';
import { SettingsComponent } from './settings/settings.component';
import { GradesComponent } from './grades/grades.component';
import { CalendarComponent } from './calendar/calendar.component';
import { CalendarDialogComponent } from './calendar/dialog';
import { GradesDialogComponent } from './grades/dialog';
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
    GradesDialogComponent,
    CalendarComponent,
    CalendarDialogComponent
  ],
  entryComponents: [
    CalendarDialogComponent,
    GradesDialogComponent
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
    MatSnackBarModule,
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
