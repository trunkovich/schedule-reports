/**
 * Created by TrUnK on 05.01.2017.
 */
export interface QualifiedEmployeeGroup {
  letter: string;
  physicians: QualifiedEmployee[];
}

export interface QualifiedEmployee {
  selected: boolean;
  employee: Employee;
}

export interface EditEmployeeRequestData {
  email?: string;
  mobilePhone?: string;
  workUnitValue?: number;
}

export interface Employee {
  EmployeeID: number;
  GroupID: number;
  FirstName: string;
  LastName: string;
  Email: string;
  MobilePhone: string;
  PhotoUrl: string;
  WorkUnitValue: number;
  RegistrationCompletionDateTime: string | null;
  EmployeeStatusID: number;
  EmployeePositionID: number;
  EmployeeSpecializationID: number;
  ScheduledPersonID: number | null;
}

/**
 using System;
 using System.Collections.Generic;
 using System.Linq;
 using System.Web;

 namespace Paycal.API.Models
 {
     public class EmployeeDTO
     {
         public int EmployeeID { get; set; }
         public int GroupID { get; set; }
         public string FirstName { get; set; }
         public string LastName { get; set; }
         public string Email { get; set; }
         public string MobilePhone { get; set; }
         public string PhotoUrl { get; set; }
         public decimal? WorkUnitValue { get; set; }

         //public string InvitationCode { get; set; }     //Should not be returned to the client for security reasons
         //public string PasswordResetCode { get; set; }  //Should not be returned to the client for security reasons

         public DateTime? RegistrationCompletionDateTime { get; set; }

         public byte EmployeeStatusID { get; set; }
         public int EmployeePositionID { get; set; }
         public int EmployeeSpecializationID { get; set; }

         //public int? ScheduledPersonID { get; set; }   //Should not be returned to the client for security reasons
     }
 }
 */
