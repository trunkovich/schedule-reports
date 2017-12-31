import { Response } from './response.model';
import { Hospital } from './hospital.model';

export interface HospitalsListResponse extends Response {
  HospitalList: Hospital[];
}
