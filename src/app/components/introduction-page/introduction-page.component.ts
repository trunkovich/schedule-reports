import { Component, Input } from '@angular/core';
import * as moment from 'moment';

@Component({
  selector: 'app-introduction-page',
  templateUrl: './introduction-page.component.html',
  styleUrls: ['./introduction-page.component.scss']
})
export class IntroductionPageComponent {
  @Input() scheduleDate: moment.Moment;
  @Input() group: string;
}
