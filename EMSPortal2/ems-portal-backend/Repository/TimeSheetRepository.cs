using DocumentFormat.OpenXml.InkML;
using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.ApiResponse;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class TimeSheetRepository : ITimeSheetRepository
    {
        private readonly POCEmployeePortalContext _db;

        public TimeSheetRepository(POCEmployeePortalContext dbContext)
        {
            _db = dbContext;
        }

        public IEnumerable<Timesheet> GetAllTimeSheets()
        {
            return _db.Timesheets.ToList();
        }

        public Timesheet GetTimeSheetById(int id)
        {
            return _db.Timesheets.Find(id);
        }

        public WeeklyTimesheet GetTimeSheetByEmpId(string empId)
        {
            return _db.WeeklyTimesheets
                .FirstOrDefault(t => t.EmpId == empId);
        }


        //public async Task<List<WeeklyTimesheet>> GetEmployeeByRoleId(int companyId, int roleId)
        //{
        //    return await _db.WeeklyTimesheets
        //                       .Where(x => x.CompanyId == companyId && x.RoleId == roleId)
        //        .ToListAsync();
        //}



        public async Task AddTimesheetAsync(WeeklyTimesheet timesheet)
        {
            // Identify unique timesheet by EmployeeId + WeekNo
            var existing = await _db.WeeklyTimesheets
           .FirstOrDefaultAsync(x => x.TimesheetId == timesheet.TimesheetId);


            if (existing != null)
            {
                // ✅ Update existing
                existing.FiscalWeek = timesheet.FiscalWeek;
                existing.Month = timesheet.Month;
                existing.WeekNo = timesheet.WeekNo;
                existing.LeaveType = timesheet.LeaveType;
                existing.ProjectManager = timesheet.ProjectManager;
                existing.TotalWeekHours = timesheet.TotalWeekHours;
                existing.ProjectName = timesheet.ProjectName;
                existing.SunHours = timesheet.SunHours;
                existing.MonHours = timesheet.MonHours;
                existing.TuesHours = timesheet.TuesHours;
                existing.WedHours = timesheet.WedHours;
                existing.ThursHours = timesheet.ThursHours;
                existing.FriHours = timesheet.FriHours;
                existing.SatHours = timesheet.SatHours;
                existing.SunDescription = timesheet.SunDescription;
                existing.MonDescription = timesheet.MonDescription;
                existing.TuesDescription = timesheet.TuesDescription;
                existing.WedDescription = timesheet.WedDescription;
                existing.ThursDescription = timesheet.ThursDescription;
                existing.FriDescription = timesheet.FriDescription;
                existing.SatDescription = timesheet.SatDescription;
                existing.EmpId = timesheet.EmpId;
                existing.CompanyId = timesheet.CompanyId;
                existing.SunLeave = timesheet.SunLeave;
                existing.MonLeave = timesheet.MonLeave;
                existing.TuesLeave = timesheet.TuesLeave;
                existing.WedLeave = timesheet.WedLeave;
                existing.ThursLeave = timesheet.ThursLeave;
                existing.FriLeave = timesheet.FriLeave;
                existing.SatLeave = timesheet.SatLeave;
                existing.TimesheetSatus = timesheet.TimesheetSatus;


                _db.WeeklyTimesheets.Update(existing);
            }
            else
            {
                // ✅ Insert new
                _db.WeeklyTimesheets.Add(timesheet);
            }

            await _db.SaveChangesAsync();
        }

        public async Task<List<WeeklyTimesheet>> GetTimesheetsAsync()
        {
            return await _db.WeeklyTimesheets.ToListAsync();
        }

        public async Task AddOrUpdateLeaveAsync(TimesheetLeave leave)
        {
            var existing = await _db.TimesheetLeaves
                .FirstOrDefaultAsync(x => x.EmployeeName == leave.EmployeeName &&
                              x.FiscalWeek == leave.FiscalWeek &&
                              x.Day == leave.Day &&
                              x.ProjectName == leave.ProjectName);


            if (existing != null)
            {

                existing.LeaveType = leave.LeaveType;
                existing.TimesheetId = leave.TimesheetId;
                existing.ProjectName = leave.ProjectName;
                existing.ProjectManager = leave.ProjectManager;
                existing.Allocate = leave.Allocate;
                existing.Taken = leave.Taken;
                existing.RemainingLeave = leave.RemainingLeave;

                _db.TimesheetLeaves.Update(existing);
            }
            else
            {
                // Add new record
                await _db.TimesheetLeaves.AddAsync(leave);
            }

            await _db.SaveChangesAsync();
        }

        public async Task<LeaveProData> GetLeaveDataByMonthAsync(string month)
        {
            return await _db.LeaveProData
                .FirstOrDefaultAsync(x => x.Month == month);
        }



        public async Task<List<TimesheetLeave>> GetLeavesAsync()
        {
            return await _db.TimesheetLeaves.ToListAsync();

        }
        public IEnumerable<FiscalWeekMaster> GetAllWeeks()
        {
            return _db.FiscalWeekMasters.ToList();
        }
        public async Task<List<FiscalWeekMaster>> GetWeekByDefault()
        {

            var allWeeks = await _db.FiscalWeekMasters
                .Where(w => w.FiscalYear == DateTime.Today.Year)
                .OrderBy(w => w.WeekNo)
                .ToListAsync();

            var today = DateTime.Today;
            var currentWeek = allWeeks.FirstOrDefault(w => today >= w.StartDate && today <= w.EndDate);

            if (currentWeek == null) return new List<FiscalWeekMaster>();

            int currentWeekNo = currentWeek.WeekNo;

            var recentWeeks = allWeeks
                .Where(w => w.WeekNo <= currentWeekNo && w.WeekNo > currentWeekNo - 5)
                .OrderBy(w => w.WeekNo)
                .ToList();

            return recentWeeks;

        }

        public async Task<List<WeeklyTimesheet>> GetEmployeeByCompanyId(int companyId, string? empId )
        {
            var query = _db.WeeklyTimesheets.AsQueryable();

   
            query = query.Where(w => w.CompanyId == companyId);


            if (!string.IsNullOrWhiteSpace(empId))
                query = query.Where(w => w.EmpId.Trim().ToLower() == empId.Trim().ToLower());

          
            return await query
                .Select(w => new WeeklyTimesheet
                {
                    EmpId = w.EmpId,
                    CompanyId = w.CompanyId,
                   
                })
                .ToListAsync();
        }

        public async Task<List<WeeklyTimesheet>> GetEmployeeByRoleId(int companyId, int roleId)
        {
            return await _db.WeeklyTimesheets
                .Where(w => w.CompanyId == companyId && w.RoleId == roleId)
                .Select(w => new WeeklyTimesheet
                { 
                    CompanyId = w.CompanyId,
                    RoleId = w.RoleId,
                })
                .ToListAsync();
        }


    }
}