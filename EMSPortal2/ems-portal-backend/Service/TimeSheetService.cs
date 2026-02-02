using DocumentFormat.OpenXml.InkML;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.ApiResponse;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class TimeSheetService : ITimeSheetService
    {
        private readonly ITimeSheetRepository _repository;
        private readonly IWebHostEnvironment _env;
       

        public TimeSheetService(ITimeSheetRepository repository, IWebHostEnvironment env)
        {
            _repository = repository;
            _env = env;
           
        }

        public async Task SaveTimesheetsAsync(IEnumerable<WeeklyTimesheet> timesheets)
        {
            foreach (var ts in timesheets)
            {
                await _repository.AddTimesheetAsync(ts);
            }
        }

        public async Task<LeaveProData> GetLeaveDataByMonthAsync(string month)
        {
            return await _repository.GetLeaveDataByMonthAsync(month);
        }


        public async Task<List<WeeklyTimesheet>> GetTimesheetsAsync()
        {
            return await _repository.GetTimesheetsAsync();
        }

        public IEnumerable<Timesheet> GetAllTimeSheets()
            => _repository.GetAllTimeSheets();

        public WeeklyTimesheet GetTimeSheetByEmpId(string empId)
            => _repository.GetTimeSheetByEmpId(empId);

        public async Task SaveOrUpdateLeaveAsync(TimesheetLeave leave)
        {
            await _repository.AddOrUpdateLeaveAsync(leave);
        }
        public async Task<List<TimesheetLeave>> GetLeavesAsync()
        {
            return await _repository.GetLeavesAsync();
        }

        public async Task<List<WeeklyTimesheet>> GetEmployeeByRoleId(int companyId, int roleId)
        {
            return await _repository.GetEmployeeByRoleId(companyId, roleId);
        }
        public IEnumerable<FiscalWeekMaster> GetAllWeeks()
            => _repository.GetAllWeeks();

        public async Task<List<FiscalWeekMaster>> GetWeekByDefault()
        {
            return await _repository.GetWeekByDefault();
        }
        public async Task<List<WeeklyTimesheet>> GetEmployeeByCompanyId(int companyId, string? empId)
        {
            return await _repository.GetEmployeeByCompanyId(companyId, empId);
        }

    }
}