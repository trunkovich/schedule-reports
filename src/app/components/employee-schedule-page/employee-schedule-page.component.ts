import { Component, Input } from '@angular/core';
import * as moment from 'moment';
import * as _ from 'lodash';

import { Employee } from '../../models/employee.model';
import { HospitalistRoundings, RequestCalendar } from '../../services/schedule-request-calendar.class';

@Component({
  selector: 'app-employee-schedule-page',
  templateUrl: './employee-schedule-page.component.html',
  styleUrls: ['./employee-schedule-page.component.scss']
})
export class EmployeeSchedulePageComponent {
  hospitalRoundings: string[] = [];
  _calendar: RequestCalendar;
  @Input() employee: Employee;
  @Input() scheduleDate: moment.Moment;

  @Input() set calendar(calendar: RequestCalendar) {
    if (calendar.hospitalistRoundings) {
      this.parseHospitalistRoundings(calendar.hospitalistRoundings);
    }
    this._calendar = calendar;
  }
  get calendar(): RequestCalendar {
    return this._calendar;
  }

  parseHospitalistRoundings(roundings: HospitalistRoundings) {
    _.each(roundings,
      (rounding) => {
        if (rounding) {
          const from = moment(rounding);
          const to = moment(from).endOf('week');
          let str = `from ${from.format('MMM. Do')} to `;
          if (from.isSame(to, 'month')) {
            str += to.format('Do');
          } else {
            str += to.format('MMM. Do');
          }
          this.hospitalRoundings.push(str);
        }
      }
    );
  }
}
