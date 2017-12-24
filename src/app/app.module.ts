import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ScheduleServiceService } from './services/schedule-service.service';
import { SchedulesComponent } from './components/schedules/schedules.component';


@NgModule({
  declarations: [
    AppComponent,
    SchedulesComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    ScheduleServiceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
