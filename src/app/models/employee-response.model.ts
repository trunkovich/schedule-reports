/**
 * Created by TrUnK on 05.01.2017.
 */

import {Response} from './response.model';
import { Employee } from './employee.model';

export interface EmployeeResponse extends Response {
  Employee: Employee;
}

/**
 using System;
 using System.Collections.Generic;
 using System.Linq;
 using System.Web;

 namespace Paycal.API.Models.Result
 {
     public class EmployeeResult : OperationResult
     {
         public EmployeeDTO Employee { get; set; }
     }
 }
 */
