namespace POCEmployeePortal.Models
{
    public class TimesheetLeave
    {
        public int SrNo { get; set; }
        public string EmployeeName { get; set; } = null!;
        public string? LeaveType { get; set; }
        public string FiscalWeek { get; set; } = null!;
        public string Day { get; set; } = null!;
        public double? RemainingLeave { get; set; }
        public int? TimesheetId { get; set; }
        public string? ProjectName { get; set; }
        public string? ProjectManager { get; set; }
        public double Allocate { get; set; }
        public double Taken { get; set; }


        public virtual WeeklyTimesheet? Timesheet { get; set; }

    }
}
