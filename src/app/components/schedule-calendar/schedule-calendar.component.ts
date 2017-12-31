import { Component, Input } from '@angular/core';

import { DayEntry } from '../../services/schedule-request-calendar.class';

@Component({
  selector: 'app-schedule-calendar',
  templateUrl: './schedule-calendar.component.html',
  styleUrls: ['./schedule-calendar.component.scss']
})
export class ScheduleCalendarComponent {
  @Input() days: DayEntry[];
  @Input() header: string;
  @Input() readOnlyMode: boolean;

  constructor() {}

  isArray(array): boolean {
    return Array.isArray(array);
  }

}
