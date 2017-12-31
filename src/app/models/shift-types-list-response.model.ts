import { Response } from './response.model';
import { ShiftType } from './shift-type.model';

export interface ShiftTypesListResponse extends Response {
  ShiftList: ShiftType[];
}
