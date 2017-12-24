

export interface CreateScheduleModel {
  ScheduleRequestID: number;
  ScheduleMonth: number;
  ScheduleYear: number;
  RequestStatusID: number;
  RequestDeadline: string;
  UseCompTime: boolean;
  EmployeeNotes: string;
  EmployeeID: number;
  GroupID: number;
}

export interface GeneralStartEndEntry {
  StartDate: string;
  EndDate: string;
  ScheduleRequestID: number;
  EmployeeID: number;
  GroupID: number;
}

export interface GeneralDateEntry {
  Date: string;
  ScheduleRequestID: number;
  EmployeeID: number;
  GroupID: number;
}

export interface VacationWindowModel extends GeneralStartEndEntry {
  VacationWindowID: number;
  VacationWindowTypeID: number;
}

export interface CallUnavailabilityWindowModel extends GeneralDateEntry {
  CallUnavailabilityWindowID: number;
  CallUnavailabilityTypeID: number;
}

export interface PreferredCallNightModel extends GeneralDateEntry {
  PreferredCallNightID: number;
  CallNightTypeID: number;
}

export interface HospitalistRoundingModel extends GeneralStartEndEntry {
  HospitalRoundingID: number;
  RoundingTypeID: number;
}

export interface VolunteerShiftModel extends GeneralDateEntry {
  VolunteerShiftID: number;
  HospitalID: number;
  ShiftID: number;
}

export interface EducationalLeaveModel extends GeneralDateEntry {
  EducationalLeaveID: number;
  ActivityName: string;
  ActivityDescription: string;
}

export interface PreferredOffWeekendModel extends GeneralStartEndEntry {
  PreferredOffWeekendID: number;
  Label: string;
}


export interface CreateScheduleDetailsModel {
  ScheduleRequest: CreateScheduleModel;
  VacationWindowList: VacationWindowModel[];
  CallUnavailabilityWindowList: CallUnavailabilityWindowModel[];
  PreferredCallNightList: PreferredCallNightModel[];
  HospitalistRoundingList: HospitalistRoundingModel[];
  VolunteerShiftList: VolunteerShiftModel[];
  EducationalLeaveList: EducationalLeaveModel[];
  PreferredOffWeekendList: PreferredOffWeekendModel[];
}
