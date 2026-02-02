using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class DailyTask
    {
        public int TaskId { get; set; }
        public string EmpId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string TaskDetails { get; set; } = null!;
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public decimal EstimatedHours { get; set; }
        public decimal CompletedInHours { get; set; }
        public string? Comment { get; set; }
        public string? Status { get; set; }
        public string? ManagerRemark { get; set; }
        public string? ProjectName { get; set; }
        public string? ManagerName { get; set; }
    }
}