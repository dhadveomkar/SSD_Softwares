using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class Users
    {
        public string? EmpId { get; set; }
        //public string? ManagerId { get; set; }
        public bool? IsManagerAssigned { get; set; }
        public string? UserName { get; set; }
        public string? FirstName { get; set; }
        public string? MiddleName { get; set; }
        public string? LastName { get; set; }
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
        public string? Gender { get; set; }
        public string? Address { get; set; }
        public string? MobileNumber { get; set; }
        public DateTime? DateOfBirth { get; set; }
      //  public string? Department { get; set; }
       // public string? Designation { get; set; }
      //  public string? CompanyName { get; set; }
        public string? Holiday { get; set; }

        public string? Role { get; set; }
        public DateTime? JoiningDate { get; set; }
        public string? ReportingManager { get; set; }
        public string? ResetOtp { get; set; }
        public DateTime? ResetOtpExpiry { get; set; }
        public bool? IsOtpVerified { get; set; }

        public string? Timesheet { get; set; }
        public int? CompanyId { get; set; }
        public int? DepartmentId { get;set; }
        public int? DesignationId { get; set; }

        public int? RoleId  { get; set; }


    }
}
