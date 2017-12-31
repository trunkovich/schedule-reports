import { Pipe, PipeTransform } from '@angular/core';
import * as _ from 'lodash';

import { CallUnavailabilityType } from '../models/call-unavailability-type.model';
import { ScheduleService } from '../services/schedule.service';
import { ShiftType } from '../models/shift-type.model';
import { Hospital } from '../models/hospital.model';

@Pipe({
  name: 'callUnavailabilityType',
  pure: false
})
export class CallUnavailabilityTypePipe implements PipeTransform {
  callUnavailabilityTypes: CallUnavailabilityType[];

  constructor(private scheduleService: ScheduleService) {
    this.scheduleService.callUnavailabilityTypes$
      .subscribe(types => this.callUnavailabilityTypes = types);
  }

  transform(value: number, args?: any): string {
    if (!this.callUnavailabilityTypes || !this.callUnavailabilityTypes.length) {
      return value ? value.toString() : '';
    }
    const type: CallUnavailabilityType = _.find(this.callUnavailabilityTypes,
      (callUnavailabilityType) => callUnavailabilityType.CallUnavailabilityTypeID === value
    );
    if (type) {
      return type.Description;
    }
    return value ? value.toString() : '';
  }
}

@Pipe({
  name: 'shiftType',
  pure: false
})
export class ShiftTypePipe implements PipeTransform {
  shiftTypes: ShiftType[];

  constructor(private scheduleService: ScheduleService) {
    this.scheduleService.shiftTypes$
      .subscribe(types => this.shiftTypes = types);
  }

  transform(value: number, args?: any): string {
    if (!this.shiftTypes || !this.shiftTypes.length) {
      return value ? value.toString() : '';
    }
    const type: ShiftType = _.find(this.shiftTypes,
      (shiftType) => shiftType.ShiftID === value
    );
    if (type) {
      return type.Description;
    }
    return value ? value.toString() : '';
  }
}

@Pipe({
  name: 'hospital',
  pure: false
})
export class HospitalPipe implements PipeTransform {
  hospitals: Hospital[];

  constructor(private scheduleService: ScheduleService) {
    this.scheduleService.hospitals$
      .subscribe(hospitals => this.hospitals = hospitals);
  }

  transform(value: number, args?: any): string {
    if (!this.hospitals || !this.hospitals.length) {
      return value ? value.toString() : '';
    }
    const hospital: Hospital = _.find(this.hospitals,
      (hosp) => hosp.HospitalID === value
    );
    if (hospital) {
      return hospital.Abbreviation;
    }
    return value ? value.toString() : '';
  }
}
