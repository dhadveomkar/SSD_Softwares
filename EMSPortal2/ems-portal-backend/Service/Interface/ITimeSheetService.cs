using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.ApiResponse;
using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface ITimeSheetService
    {
        IEnumerable<Timesheet> GetAllTimeSheets();
        WeeklyTimesheet GetTimeSheetByEmpId(string empId);

        Task SaveTimesheetsAsync(IEnumerable<WeeklyTimesheet> timesheets);
        Task<List<WeeklyTimesheet>> GetTimesheetsAsync();
        Task SaveOrUpdateLeaveAsync(TimesheetLeave leave);
        Task<List<TimesheetLeave>> GetLeavesAsync();

        Task<LeaveProData> GetLeaveDataByMonthAsync(string month);

        Task<List<WeeklyTimesheet>> GetEmployeeByRoleId(int companyId, int roleId);
        IEnumerable<FiscalWeekMaster> GetAllWeeks();
        Task<List<FiscalWeekMaster>> GetWeekByDefault();
        Task<List<WeeklyTimesheet>> GetEmployeeByCompanyId(int companyId, string? empId);
    }
}