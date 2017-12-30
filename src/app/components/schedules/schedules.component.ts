import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';

import { QueryParams, ScheduleService } from '../../services/schedule.service';
import { getAllUrlParams } from '../../utils/utils';
import { ScheduleData } from '../../models/create-schedule.model';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  wrongParams: boolean;
  params: QueryParams;
  scheduleDate: moment.Moment;
  scheduleData: ScheduleData[];

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit() {
    const params: any = getAllUrlParams();
    if (!params || !params.groupid || !params.scheduleyear || !params.schedulemonth) {
      this.wrongParams = true;
    } else {
      this.params = {
        groupId: params.groupid,
        scheduleYear: params.scheduleyear,
        scheduleMonth: params.schedulemonth
      };
      this.scheduleDate = moment({month: +this.params.scheduleMonth, year: +this.params.scheduleYear});
      this.scheduleService.loadData(this.params)
        .subscribe((data: ScheduleData[]) => {
          this.scheduleData = data;
        });
    }
  }
}
