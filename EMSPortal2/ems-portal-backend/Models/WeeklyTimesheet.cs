using POCEmployeePortal.Models;

public class WeeklyTimesheet
{
    public WeeklyTimesheet()
    {
        TimesheetLeaves = new HashSet<TimesheetLeave>();
    }

    public int TimesheetId { get; set; }
    public string EmployeeName { get; set; } = null!;
    public int WeekNo { get; set; }
    public string FiscalWeek { get; set; } = null!;
    public string Month { get; set; } = null!;
    public string? LeaveType { get; set; }
    public string? ProjectName { get; set; }
    public decimal? TotalWeekHours { get; set; }

    public decimal? SunHours { get; set; }
    public string? SunDescription { get; set; }

    public decimal? MonHours { get; set; }
    public string? MonDescription { get; set; }

    public decimal? TuesHours { get; set; }
    public string? TuesDescription { get; set; }

    public decimal? WedHours { get; set; }
    public string? WedDescription { get; set; }

    public decimal? ThursHours { get; set; }
    public string? ThursDescription { get; set; }

    public decimal? FriHours { get; set; }
    public string? FriDescription { get; set; }

    public decimal? SatHours { get; set; }
    public string? SatDescription { get; set; }

    public string? ProjectManager { get; set; }

    public string? EmpId { get; set; }
    public int? CompanyId { get; set; }
    public string? SunLeave { get; set; }
    public string? MonLeave { get; set; }
    public string? TuesLeave { get; set; }
    public string? WedLeave { get; set; }
    public string? ThursLeave { get; set; }
    public string? FriLeave { get; set; }
    public string? SatLeave { get; set; }
    public string? TimesheetSatus { get; set; }
    public int? RoleId { get; set; }

    public virtual ICollection<TimesheetLeave> TimesheetLeaves { get; set; }
}
