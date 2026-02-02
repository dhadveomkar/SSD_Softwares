using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class LeaveRequest
    {
        public int ApplicationId { get; set; }
        public string EmpId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public decimal LeaveCount { get; set; }

        public string LeaveType { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string? Description { get; set; }
        public string? ManagerRemark { get; set; }
        public string? Status { get; set; }
        public string? LeaveDuration { get; set; }
        public string? To { get; set; }
        public string? Cc { get; set; }

        public DateTime CreatedOn { get; set; }

        public string? ApprovalName { get; set; }
        public string? ApprovalEmail { get; set; }

        public string? MailBody { get; set; }





    }
}
