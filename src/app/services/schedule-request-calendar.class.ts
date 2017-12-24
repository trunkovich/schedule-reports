import * as _ from 'lodash';
import * as moment from 'moment';

import * as requestModels from '../models/create-schedule.model';
import { getOrdinal } from '../utils/utils';

export interface DayEntry {
  date: moment.Moment | null;
  blank: boolean;
  disabled: boolean;
  event: string;
  weekSelected: number | null;
  otherMonth: boolean;
}

export type VacationDay = {type: number; start: moment.Moment; end?: moment.Moment; };
export type VacationDays = Array<VacationDay | null>;
export type CallUnavailabilityDay = { date: moment.Moment; type: number; };
export type CallUnavailabilityDays = Array<CallUnavailabilityDay | null>;
export type EducationLeave = { date: moment.Moment; name: string; description: string; };
export type EducationLeaves = Array<EducationLeave | null>;
export type CallNight = moment.Moment;
export type CallNights = {[key: string ]: CallNight };
export type Weekend = {label: string; start: moment.Moment; end: moment.Moment; num: number; disabled: boolean; };
export type HospitalistRoundings = Array<moment.Moment | null>;
export type VolunteerShift = { date: moment.Moment; hospitalId: number; shiftId: number; };

export class RequestCalendar {
  month: number;
  year: number;
  vacationDays: VacationDays;
  callUnavailabilityDates: CallUnavailabilityDays;
  educationLeaves: EducationLeaves;
  callNights: CallNights;
  offWeekend: Weekend | null;
  weekends: Weekend[];
  hospitalistRoundings: HospitalistRoundings;
  volunteerShift: VolunteerShift;
  compTime: boolean;
  details: string;
  days: DayEntry[];
  events = {};
  selectedWeeks = {};
  private initialData: requestModels.CreateScheduleDetailsModel;

  constructor(request: requestModels.CreateScheduleDetailsModel) {
    this.initialData = request;
    this.month = request.ScheduleRequest.ScheduleMonth - 1;
    this.year = request.ScheduleRequest.ScheduleYear;

    this.fillVacationDays(request.VacationWindowList);
    this.fillCallUnavailabilityDays(request.CallUnavailabilityWindowList);
    this.fillEducationLeaves(request.EducationalLeaveList);
    this.fillCallNights(request.PreferredCallNightList);
    this.fillHospitalistRoundings(request.HospitalistRoundingList);
    this.fillVolunteerShift(request.VolunteerShiftList);
    this.compTime = request.ScheduleRequest.UseCompTime;
    this.details = request.ScheduleRequest.EmployeeNotes;


    this.weekends = this.getWeekends(moment({year: this.year, month: this.month}));
    this.fillOffWeekend(request.PreferredOffWeekendList);

    this.days = this.fillDays(request);
  }

  fillDays(request: requestModels.CreateScheduleDetailsModel) {
    const days = [];
    const month = request.ScheduleRequest.ScheduleMonth - 1;
    const year = request.ScheduleRequest.ScheduleYear;
    const currentDay = moment({year, month}).startOf('week');
    const endDay = moment({year, month}).endOf('month').endOf('week').add(1, 'day');
    let weekDays;
    while (!currentDay.isSame(endDay, 'day')) {
      const otherMonth = currentDay.month() !== month;
      const haveEvent = !!this.events[currentDay.format('MM.DD')];
      if (this.selectedWeeks[currentDay.format('MM.DD')]) {
        weekDays = 7;
      }
      const events = this.getEvents(currentDay, weekDays ? '#fd995d' : null);
      days.push({
        date: moment(currentDay),
        blank: otherMonth,
        disabled: haveEvent || otherMonth,
        event: events,
        weekSelected: weekDays ? weekDays-- : null,
        otherMonth
      });
      currentDay.add(1, 'day');
    }
    return days;
  }

  addEvent(day: moment.Moment, color: string) {
    if (!this.events[day.format('MM.DD')]) {
      this.events[day.format('MM.DD')] = color;
    } else {
      if (!Array.isArray(this.events[day.format('MM.DD')])) {
        this.events[day.format('MM.DD')] = [this.events[day.format('MM.DD')]];
      }
      this.events[day.format('MM.DD')].push(color);
    }
  }

  getEvents(day: moment.Moment, additionalEvent: string | null): string | Array<string> | null {
    const eventsEntry = this.events[day.format('MM.DD')];
    if (!eventsEntry && !additionalEvent) {
      return null;
    }
    let events: Array<string> = [];
    if (eventsEntry) {
      if (Array.isArray(eventsEntry)) {
        events = _.clone(eventsEntry);
      } else {
        events.push(eventsEntry);
      }
    }
    if (additionalEvent) {
      events.unshift(additionalEvent);
    }
    return events.length === 1 ? events[0] : events;
  }

  fillVacationDays(vacationWindowList: requestModels.VacationWindowModel[]) {
    if (vacationWindowList.length) {
      this.vacationDays = _.map(
        vacationWindowList,
        (vacation: requestModels.VacationWindowModel) => {
          return {
            type: vacation.VacationWindowTypeID,
            start: moment(vacation.StartDate),
            end: vacation.VacationWindowTypeID === 2 ? moment(vacation.EndDate) : null
          };
        }
      );
      _.each(this.vacationDays, (day: VacationDay) => {
        if (day.type === 1) {
          this.addEvent(day.start, '#ffd300');
        } else {
          const date = moment(day.start);
          while (date.isSameOrBefore(day.end)) {
            this.addEvent(date, '#ffd300');
            date.add(1, 'day');
          }
        }
      });
    } else {
      this.vacationDays = [{type: 1, start: null}];
    }
  }
  setVacationDays(vacationDays: VacationDays): RequestCalendar {
    const newData = _.cloneDeep<requestModels.CreateScheduleDetailsModel>(this.initialData);
    newData.VacationWindowList = _.map(vacationDays, (vacationDay: VacationDay) => {
      return {
        StartDate: vacationDay.start.toISOString(),
        EndDate: vacationDay.type === 2 ? (!!vacationDay.end ? vacationDay.end.toISOString() : null) : vacationDay.start.toISOString(),
        ScheduleRequestID: this.initialData.ScheduleRequest.ScheduleRequestID,
        EmployeeID: this.initialData.ScheduleRequest.EmployeeID,
        GroupID: this.initialData.ScheduleRequest.GroupID,
        VacationWindowID: null,
        VacationWindowTypeID: vacationDay.type,
      };
    });
    return new RequestCalendar(newData);
  }
  isVacationWindowsChanged(): boolean {
    return _.some(this.initialData.VacationWindowList, vacation => !vacation.VacationWindowID);
  }
  isVacationWindowsValid(): boolean {
    return _.every(this.vacationDays, (vacationDay: VacationDay) => {
      if (!vacationDay) {
        return false;
      }
      if (vacationDay.type === 1) {
        return !!vacationDay.start && vacationDay.start.isValid();
      } else {
        return !!vacationDay.start && vacationDay.start.isValid() &&
               !!vacationDay.end && vacationDay.end.isValid() &&
               vacationDay.start.isBefore(vacationDay.end);
      }
    });
  }
  addBlankVacationDay() {
    this.vacationDays.push({type: 1, start: null});
  }
  isVacationWindowsReady(): boolean {
    return !!(
      this.initialData.VacationWindowList &&
      this.initialData.VacationWindowList.length &&
      _.some(this.initialData.VacationWindowList, (vacation) => !!vacation.VacationWindowID)
    );
  }




  fillCallUnavailabilityDays(callUnavailabilityWindowList: requestModels.CallUnavailabilityWindowModel[]) {
    if (callUnavailabilityWindowList.length) {
      this.callUnavailabilityDates = _.map(
        callUnavailabilityWindowList,
        (day: requestModels.CallUnavailabilityWindowModel) => {
          return {
            date: moment(day.Date),
            type: day.CallUnavailabilityTypeID
          };
        });
      _.each(this.callUnavailabilityDates, (day: CallUnavailabilityDay) => this.addEvent(day.date, '#5dcf5e'));
    } else {
      this.callUnavailabilityDates = [{date: null, type: 1}];
    }
  }
  setCallUnavailabilityDays(days: CallUnavailabilityDays): RequestCalendar {
    const newData = _.cloneDeep<requestModels.CreateScheduleDetailsModel>(this.initialData);
    newData.CallUnavailabilityWindowList = _.map(days, day => {
      return {
        CallUnavailabilityWindowID: null,
        CallUnavailabilityTypeID: day.type,
        Date: day.date ? day.date.toISOString() : null,
        ScheduleRequestID: this.initialData.ScheduleRequest.ScheduleRequestID,
        EmployeeID: this.initialData.ScheduleRequest.EmployeeID,
        GroupID: this.initialData.ScheduleRequest.GroupID,
      };
    });
    return new RequestCalendar(newData);
  }
  isCallUnavailabilityWindowsChanged(): boolean {
    return _.some(this.initialData.CallUnavailabilityWindowList, day => !day.CallUnavailabilityWindowID);
  }
  isCallUnavailabilityWindowsValid(): boolean {
    return _.every(this.callUnavailabilityDates, day => {
      return !!day && day.date && day.date.isValid();
    });
  }
  addBlankCallUnavailabilityDay() {
    this.callUnavailabilityDates.push({date: null, type: 1});
  }
  isCallUnavailabilityReady(): boolean {
    return !!(
      this.initialData.CallUnavailabilityWindowList &&
      this.initialData.CallUnavailabilityWindowList.length &&
      _.some(this.initialData.CallUnavailabilityWindowList, (window) => !!window.CallUnavailabilityWindowID)
    );
  }




  fillEducationLeaves(educationLeaves: requestModels.EducationalLeaveModel[]) {
    if (educationLeaves.length) {
      this.educationLeaves = _.map(
        educationLeaves,
        (day: requestModels.EducationalLeaveModel) => {
          return {
            date: moment(day.Date),
            name: day.ActivityName,
            description: day.ActivityDescription
          };
        });
      _.each(this.educationLeaves, (day: EducationLeave) => this.addEvent(day.date, '#4a90e2'));
    } else {
      this.educationLeaves = [{date: null, name: '', description: ''}];
    }
  }
  setEducationLeaves(days: EducationLeaves): RequestCalendar {
    const newData = _.cloneDeep<requestModels.CreateScheduleDetailsModel>(this.initialData);
    newData.EducationalLeaveList = _.map(days, day => {
      return {
        EducationalLeaveID: null,
        ActivityName: day.name,
        ActivityDescription: day.description,
        Date: day.date ? day.date.toISOString() : null,
        ScheduleRequestID: this.initialData.ScheduleRequest.ScheduleRequestID,
        EmployeeID: this.initialData.ScheduleRequest.EmployeeID,
        GroupID: this.initialData.ScheduleRequest.GroupID,
      };
    });
    return new RequestCalendar(newData);
  }
  isEducationLeavesChanged(): boolean {
    return _.some(this.initialData.EducationalLeaveList, day => !day.EducationalLeaveID);
  }
  isEducationLeavesValid(): boolean {
    return _.every(this.educationLeaves, day => {
      return !!day && day.date && day.date.isValid() && day.name && day.description;
    });
  }
  addBlankEducationLeave() {
    this.educationLeaves.push({date: null, name: '', description: ''});
  }
  isEducationLeaveReady(): boolean {
    return !!(
      this.initialData.EducationalLeaveList &&
      this.initialData.EducationalLeaveList.length &&
      _.some(this.initialData.EducationalLeaveList, (leave) => !!leave.EducationalLeaveID)
    );
  }




  fillCallNights(callNights: requestModels.PreferredCallNightModel[]) {
    this.callNights = {1: null, 2: null, 3: null, 4: null, 5: null};
    if (callNights.length) {
      const nights = _.map(
        callNights,
        (day: requestModels.PreferredCallNightModel) => day.Date ? moment(day.Date) : null);
      _.each(nights, (day: CallNight, index) => {
        this.callNights[index + 1] = day;
        if (day && day.isValid()) {
          this.addEvent(day, '#f978a7');
        }
      });
    }
  }
  setCallNights(days: CallNights): RequestCalendar {
    const newData = _.cloneDeep<requestModels.CreateScheduleDetailsModel>(this.initialData);
    newData.PreferredCallNightList = _.map(days, (day, key) => {
      if (!day) {
        return null;
      }
      return {
        PreferredCallNightID: null,
        CallNightTypeID: +key,
        Date: day ? day.toISOString() : null,
        ScheduleRequestID: this.initialData.ScheduleRequest.ScheduleRequestID,
        EmployeeID: this.initialData.ScheduleRequest.EmployeeID,
        GroupID: this.initialData.ScheduleRequest.GroupID,
      };
    });
    newData.PreferredCallNightList = _.filter(newData.PreferredCallNightList, night => !!night);
    return new RequestCalendar(newData);
  }
  isCallNightsChanged(): boolean {
    return _.some(this.initialData.PreferredCallNightList, day => !day.PreferredCallNightID);
  }
  isCallNightsValid(): boolean {
    return _.every(this.callNights, (day, key) => {
      if (key && (+key > 2)) {
        return !!day && day.isValid() || !day;
      }
      return !!day && day.isValid();
    });
  }
  isCallNightsReady(): boolean {
    return !!(
      this.initialData.PreferredCallNightList &&
      this.initialData.PreferredCallNightList.length &&
      _.filter(this.initialData.PreferredCallNightList, (callNight) =>
        callNight.CallNightTypeID > 0 && callNight.CallNightTypeID < 3 && callNight.PreferredCallNightID
      ).length === 2
    );
  }




  fillOffWeekend(offWeekend: requestModels.PreferredOffWeekendModel[]) {
    if (!offWeekend || !offWeekend.length) {
      this.offWeekend = null;
    } else {
      const weekends = this.getWeekends(moment(offWeekend[0].StartDate));
      this.offWeekend = _.find(weekends, (weekend) => weekend.start.isSame(moment(offWeekend[0].StartDate), 'day'));
      const start = moment(this.offWeekend.start);
      this.addEvent(start, '#ab78f9');
      this.addEvent(start.add(1, 'day'), '#ab78f9');
      this.addEvent(start.add(1, 'day'), '#ab78f9');
    }
  }
  setOffWeekends(weekend: Weekend): RequestCalendar {
    const newData = _.cloneDeep<requestModels.CreateScheduleDetailsModel>(this.initialData);
    newData.PreferredOffWeekendList = [{
      StartDate: weekend.start.toISOString(),
      EndDate: weekend.end.toISOString(),
      ScheduleRequestID: this.initialData.ScheduleRequest.ScheduleRequestID,
      EmployeeID: this.initialData.ScheduleRequest.EmployeeID,
      GroupID: this.initialData.ScheduleRequest.GroupID,
      PreferredOffWeekendID: null,
      Label: weekend.label
    }];
    return new RequestCalendar(newData);
  }
  getWeekends(month: moment.Moment): Weekend[] {
    const weekends: Weekend[] = [];
    const date = moment(month).startOf('month').isoWeekday(5);
    let num = 1;
    while (date.isSame(month, 'month')) {
      const weekend = {
        start: moment(date),
        end: moment(date).add(2, 'day'),
        label: '',
        num,
        disabled: false
      };
      let label = `${getOrdinal(weekend.num)} Weekend (${weekend.start.format('MMM D')}`;
      if (weekend.end.isSame(weekend.start, 'month')) {
        label += `-${weekend.end.format('Do')})`;
      } else {
        label += ` - ${weekend.end.format('MMM D')})`;
      }
      weekend.label = label;
      weekends.push(weekend);
      date.add(1, 'week');
      num++;
    }
    _.each(weekends, weekend => {
      const dates: any[] = [
        moment(weekend.start),
        moment(weekend.start).add(1, 'day'),
        moment(weekend.start).add(2, 'day')
      ];
      if (_.some(dates, day => !!this.events[day.format('MM.DD')])) {
        weekend.disabled = true;
      }
    });
    return weekends;
  }
  isOffWeekendReady(): boolean {
    return !!(
      this.initialData.PreferredOffWeekendList &&
      this.initialData.PreferredOffWeekendList.length &&
      _.some(this.initialData.PreferredOffWeekendList, (offWeekend) => !!offWeekend.PreferredOffWeekendID)
    );
  }




  fillHospitalistRoundings(hospitalistRoundings: requestModels.HospitalistRoundingModel[]) {
    if (hospitalistRoundings.length) {
      const firstWeek = _.find(
        hospitalistRoundings,
        (rounding: requestModels.HospitalistRoundingModel) => rounding.RoundingTypeID === 1
      );
      const secondWeek = _.find(
        hospitalistRoundings,
        (rounding: requestModels.HospitalistRoundingModel) => rounding.RoundingTypeID === 2
      );
      this.hospitalistRoundings = [
        firstWeek ? moment(firstWeek.StartDate) : null,
        secondWeek ? moment(secondWeek.StartDate) : null
      ];
      _.each(this.hospitalistRoundings, (day: moment.Moment) => {
        if (day) {
          this.selectedWeeks[day.format('MM.DD')] = true;
        }
      });
    } else {
      this.hospitalistRoundings = [null, null];
    }
  }
  setHospitalistRoundings(days: moment.Moment[]): RequestCalendar {
    const newData = _.cloneDeep<requestModels.CreateScheduleDetailsModel>(this.initialData);
    newData.HospitalistRoundingList = [];
    _.each(days, (day, i) => {
      if (day) {
        newData.HospitalistRoundingList.push({
          StartDate: day.toISOString(),
          EndDate: day.endOf('week').toISOString(),
          ScheduleRequestID: this.initialData.ScheduleRequest.ScheduleRequestID,
          EmployeeID: this.initialData.ScheduleRequest.EmployeeID,
          GroupID: this.initialData.ScheduleRequest.GroupID,
          HospitalRoundingID: null,
          RoundingTypeID: i + 1
        });
      }
    });
    return new RequestCalendar(newData);
  }
  isHospitalistRoundingsChanged(): boolean {
    return !this.initialData.HospitalistRoundingList.length ||
      _.some(this.initialData.HospitalistRoundingList, rounding => !rounding.HospitalRoundingID);
  }
  isHospitalRoundingsBlank(): boolean {
    return !this.initialData.HospitalistRoundingList.length;
  }
  isHospitalRoundingsReady(): boolean {
    return !!(
      this.initialData.HospitalistRoundingList &&
      this.initialData.HospitalistRoundingList.length &&
      _.some(this.initialData.HospitalistRoundingList, (hospitalistRounding) => !!hospitalistRounding.HospitalRoundingID)
    );
  }




  fillVolunteerShift(volunteerShifts: requestModels.VolunteerShiftModel[]) {
    if (volunteerShifts.length) {
      this.volunteerShift = {
        date: moment(volunteerShifts[0].Date),
        hospitalId: volunteerShifts[0].HospitalID,
        shiftId: volunteerShifts[0].ShiftID
      };
      this.addEvent(this.volunteerShift.date, '#f14437');
    } else {
      this.volunteerShift = {date: null, hospitalId: null, shiftId: null};
    }
  }
  setVolunteerShift(day: VolunteerShift): RequestCalendar {
    const newData = _.cloneDeep<requestModels.CreateScheduleDetailsModel>(this.initialData);
    newData.VolunteerShiftList = [];
    if (day && day.date) {
      newData.VolunteerShiftList.push({
        VolunteerShiftID: null,
        HospitalID: day.hospitalId,
        ShiftID: day.shiftId,
        Date: day.date ? day.date.toISOString() : null,
        ScheduleRequestID: this.initialData.ScheduleRequest.ScheduleRequestID,
        EmployeeID: this.initialData.ScheduleRequest.EmployeeID,
        GroupID: this.initialData.ScheduleRequest.GroupID,
      });
    }
    return new RequestCalendar(newData);
  }
  isVolunteerShiftChanged(): boolean {
    return this.initialData.VolunteerShiftList &&
      (!this.initialData.VolunteerShiftList.length || !this.initialData.VolunteerShiftList[0].VolunteerShiftID);
  }
  isVolunteerShiftValid(): boolean {
    const shift: VolunteerShift = this.volunteerShift;
    return shift && shift.date && shift.date.isValid() && shift.hospitalId && !!shift.shiftId ||
      !shift.date && !shift.hospitalId && !shift.shiftId;
  }
  isVolunteerShiftReady(): boolean {
    return !!(
      this.initialData.VolunteerShiftList &&
      this.initialData.VolunteerShiftList.length &&
      _.some(this.initialData.VolunteerShiftList, (volunteerShift) => !!volunteerShift.VolunteerShiftID)
    );
  }

  isCompTimeSet(): boolean {
    return this.compTime === true || this.compTime === false;
  }
}
