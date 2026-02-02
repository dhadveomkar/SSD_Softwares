using POCEmployeePortal.ApiResponse;
using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface ITimeSheetRepository
    {
        IEnumerable<Timesheet> GetAllTimeSheets();
        WeeklyTimesheet GetTimeSheetByEmpId(string empId);
        Task<LeaveProData> GetLeaveDataByMonthAsync(string month);

        Task AddTimesheetAsync(WeeklyTimesheet timesheet);
        Task<List<WeeklyTimesheet>> GetTimesheetsAsync();
        Task AddOrUpdateLeaveAsync(TimesheetLeave leave);
        Task<List<TimesheetLeave>> GetLeavesAsync();
        //Task<List<WeeklyTimesheet>> GetTimesheetByRoleId(int roleId, int companyId);
        IEnumerable<FiscalWeekMaster> GetAllWeeks();
        Task<List<FiscalWeekMaster>> GetWeekByDefault();
        Task<List<WeeklyTimesheet>> GetEmployeeByCompanyId(int companyId, string? empId);
        Task<List<WeeklyTimesheet>> GetEmployeeByRoleId(int companyId, int roleId);
    }
}