import { Component, OnInit } from '@angular/core';
import { QueryParams, ScheduleService } from '../../services/schedule.service';
import { getAllUrlParams } from '../../utils/utils';

@Component({
  selector: 'app-schedules',
  templateUrl: './schedules.component.html',
  styleUrls: ['./schedules.component.scss']
})
export class SchedulesComponent implements OnInit {
  wrongParams: boolean;
  params: QueryParams;

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
      this.scheduleService.loadData(this.params)
        .subscribe(data => {
          console.log(data);
        });
    }
  }
}
