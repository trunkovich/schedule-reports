import { Response } from './response.model';
import { CallUnavailabilityType } from './call-unavailability-type.model';

export interface CallUnavailabilityTypesListResponse extends Response {
  CallUnavailabilityTypeList: CallUnavailabilityType[];
}
