import { Component, Input } from '@angular/core';
import * as moment from 'moment';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-employee-profile-page',
  templateUrl: './employee-profile-page.component.html',
  styleUrls: ['./employee-profile-page.component.scss']
})
export class EmployeeProfilePageComponent {
  @Input() employee: Employee;
}
