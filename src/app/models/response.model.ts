/**
 * Created by TrUnK on 05.01.2017.
 */

export interface Response {
  IsSuccess: boolean;
  ErrorCode: string | null;
  ErrorMessage: string | null;
}

/**
 using System;
 using System.Collections.Generic;
 using System.Linq;
 using System.Web;

 namespace Paycal.API.Models.Result
 {
     public class OperationResult
     {
         public bool IsSuccess { get; set; }
         public string ErrorCode { get; set; }
         public string ErrorMessage { get; set; }
     }
 }
 */
