import { Response } from './response.model';
import { CreateScheduleDetailsModel, CreateScheduleModel } from './create-schedule.model';

export interface ScheduleRequestByEmployeeListResponse extends Response {
  ScheduleRequestList: CreateScheduleModel[];
}

export interface ScheduleRequestDetailsResponse extends Response {
  ScheduleRequestDetails: CreateScheduleDetailsModel;
}
