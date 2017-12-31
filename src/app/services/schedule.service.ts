import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, switchMap } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable } from 'rxjs/Observable';
import { forkJoin } from 'rxjs/observable/forkJoin';
import { ScheduleRequestByEmployeeListResponse, ScheduleRequestDetailsResponse } from '../models/create-schedule-response.model';
import { EmployeeResponse } from '../models/employee-response.model';
import { Employee } from '../models/employee.model';
import { CreateScheduleDetailsModel, ScheduleData } from '../models/create-schedule.model';
import { RequestCalendar } from './schedule-request-calendar.class';
import { CallUnavailabilityTypesListResponse } from '../models/call-unavailability-types-list-response.model';
import { CallUnavailabilityType } from '../models/call-unavailability-type.model';
import { ErrorObservable } from 'rxjs/observable/ErrorObservable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ShiftType } from '../models/shift-type.model';
import { Hospital } from '../models/hospital.model';
import { ShiftTypesListResponse } from '../models/shift-types-list-response.model';
import { HospitalsListResponse } from '../models/hospitals-list-response.model';

export interface QueryParams {
  groupId: string;
  scheduleYear: string;
  scheduleMonth: string;
}

@Injectable()
export class ScheduleService {
  callUnavailabilityTypes$ = new BehaviorSubject<CallUnavailabilityType[] | null>(null);
  shiftTypes$ = new BehaviorSubject<ShiftType[] | null>(null);
  hospitals$ = new BehaviorSubject<Hospital[] | null>(null);

  constructor(private httpClient: HttpClient) {}

  loadScheduleRequests({groupId, scheduleYear, scheduleMonth}: QueryParams) {
    this.loadCallUnavailabilityTypes(groupId);
    this.loadShiftTypes(groupId);
    this.loadHospitals(groupId);
    return this.httpClient.get('http://api.brainstorm.live/api/hub/Report_GetScheduleRequestByGroupYearMonth', {
      params: { groupId, scheduleYear, scheduleMonth }
    })
      .pipe(
        map((response: ScheduleRequestByEmployeeListResponse) => {
          if (response.IsSuccess) {
            return _.map(response.ScheduleRequestList, scheduleRequest => {
              return {
                scheduleRequestId: scheduleRequest.ScheduleRequestID,
                employeeId: scheduleRequest.EmployeeID
              };
            });
          } else {
            return Observable.throw('can\'t get group schedule reports');
          }
        })
      );
  }

  loadScheduleRequestDetails(scheduleRequestId) {
    return this.httpClient.get('http://api.brainstorm.live/api/hub/Report_GetScheduleRequestDetails', {
      params: { scheduleRequestId }
    })
      .pipe(
        map((response: ScheduleRequestDetailsResponse) => {
          if (response.IsSuccess) {
            return response.ScheduleRequestDetails;
          } else {
            return Observable.throw('can\'t get user schedule report');
          }
        })
      );
  }

  loadEmployee(employeeID) {
    return this.httpClient.get('http://api.brainstorm.live/api/hub/Report_GetEmployeeByEmployeeId', {
      params: { employeeID }
    })
      .pipe(
        map((response: EmployeeResponse) => {
          if (response.IsSuccess) {
            return response.Employee;
          } else {
            Observable.throw('can\'t get employee data');
          }
        })
      );
  }

  loadCallUnavailabilityTypes(groupId) {
    this.httpClient.get(`http://api.brainstorm.live/api/hub/GetCallUnavailabilityTypes?groupid=${groupId}`)
      .pipe(
        map((response: CallUnavailabilityTypesListResponse) => {
          if (response.IsSuccess) {
            return response.CallUnavailabilityTypeList;
          } else {
            Observable.throw('can\'t get employee data');
          }
        })
      )
      .subscribe(types => {
        this.callUnavailabilityTypes$.next(types);
      });
  }

  loadShiftTypes(groupId) {
    this.httpClient.get(`http://api.brainstorm.live/api/hub/GetShiftTypes?groupid=${groupId}`)
      .pipe(
        map((response: ShiftTypesListResponse) => {
          if (response.IsSuccess) {
            return response.ShiftList;
          } else {
            Observable.throw('can\'t get shifts list');
          }
        })
      )
      .subscribe(types => {
        this.shiftTypes$.next(types);
      });
  }

  loadHospitals(groupId) {
    this.httpClient.get(`http://api.brainstorm.live/api/hub/GetHospitals?groupid=${groupId}`)
      .pipe(
        map((response: HospitalsListResponse) => {
          if (response.IsSuccess) {
            return response.HospitalList;
          } else {
            Observable.throw('can\'t get hospitals list');
          }
        })
      )
      .subscribe(hospitals => {
        this.hospitals$.next(hospitals);
      });
  }

  loadData({groupId, scheduleYear, scheduleMonth}: QueryParams): Observable<Array<ScheduleData>> {
    return this.loadScheduleRequests({groupId, scheduleYear, scheduleMonth})
      .pipe(
        switchMap((ids: Array<{scheduleRequestId: number; employeeId: number; }>) => {
            return forkJoin([
              ..._.map(ids, ({scheduleRequestId, employeeId}) => {
                return this.loadScheduleRequestDetails(scheduleRequestId);
              }),
              ..._.map(ids, ({scheduleRequestId, employeeId}) => {
                return this.loadEmployee(employeeId);
              })
            ]);
        }),
        map((data: Array<Employee | CreateScheduleDetailsModel>) => {
          const users = _.keyBy(
            _.filter(data, (item: Employee | CreateScheduleDetailsModel) => !!_.has(item, 'EmployeeID')),
            (user: Employee) => user.EmployeeID
          );
          const schedules = _.keyBy(
            _.filter(data, (item: Employee | CreateScheduleDetailsModel) => !!_.has(item, 'ScheduleRequest')),
            (report: CreateScheduleDetailsModel) => report.ScheduleRequest.EmployeeID
          );
          const arr = [];
          _.each(users, (user, employeeID) => {
            arr.push({
              employeeID,
              employee: user,
              report: schedules[employeeID],
              calendar: new RequestCalendar(schedules[employeeID])
            });
          });
          return arr;
        })
      );
  }

}
