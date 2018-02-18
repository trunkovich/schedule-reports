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
      this.vacationDays = [];
    }
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
      this.callUnavailabilityDates = [];
    }
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
      this.volunteerShift = null;
    }
  }
  isVolunteerShiftReady(): boolean {
    return !!(
      this.initialData.VolunteerShiftList &&
      this.initialData.VolunteerShiftList.length &&
      _.some(this.initialData.VolunteerShiftList, (volunteerShift) => !!volunteerShift.VolunteerShiftID)
    );
  }
}
