import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';


import { AppComponent } from './app.component';
import { ScheduleService } from './services/schedule.service';
import { SchedulesComponent } from './components/schedules/schedules.component';
import { HttpClientModule } from '@angular/common/http';
import { FlexLayoutModule } from '@angular/flex-layout';


@NgModule({
  declarations: [
    AppComponent,
    SchedulesComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,

    FlexLayoutModule
  ],
  providers: [
    ScheduleService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
