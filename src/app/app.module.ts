import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ScheduleService } from './services/schedule.service';
import { SchedulesComponent } from './components/schedules/schedules.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IntroductionPageComponent } from './components/introduction-page/introduction-page.component';
import { MomentModule } from 'angular2-moment';
import { EmployeeProfilePageComponent } from './components/employee-profile-page/employee-profile-page.component';
import { EmployeeSchedulePageComponent } from './components/employee-schedule-page/employee-schedule-page.component';
import { CallUnavailabilityTypePipe, HospitalPipe, ShiftTypePipe } from './pipes/pipes';
import { ScheduleCalendarComponent } from './components/schedule-calendar/schedule-calendar.component';


@NgModule({
  declarations: [
    AppComponent,
    SchedulesComponent,
    IntroductionPageComponent,
    EmployeeProfilePageComponent,
    EmployeeSchedulePageComponent,
    ScheduleCalendarComponent,

    CallUnavailabilityTypePipe,
    ShiftTypePipe,
    HospitalPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    MomentModule,
    FlexLayoutModule
  ],
  providers: [
    ScheduleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
