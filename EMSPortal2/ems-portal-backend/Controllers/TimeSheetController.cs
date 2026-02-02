using DocumentFormat.OpenXml.Bibliography;
using DocumentFormat.OpenXml.Office2010.ExcelAc;
using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.ApiResponse;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimesheetController : Controller
    {
        private readonly ITimeSheetService _timesheetService;

        public TimesheetController(ITimeSheetService timesheetService)
        {
            _timesheetService = timesheetService;
        }

        [HttpGet("GetAllTimeSheets")]
        public IActionResult GetAllTimeSheets()
        {
            return Ok(_timesheetService.GetAllTimeSheets());
        }

        //[HttpGet("GetTimesheetByEmpId/{empId}")]
        //public IActionResult GetTimeSheetByEmpId(string empId)
        //{
        //    var result = _timesheetService.GetTimeSheetByEmpId(empId);
        //    if (result == null)
        //    {
        //        return NotFound($"Timesheet for employee {empId} not found");
        //    }
        //    return Ok(result);
        //}
        //[HttpGet("GetTimeSheetByCompanyId/{companyId}")]
        //public async Task<ActionResult<List<WeeklyTimesheet>>> GetTimeSheetByCompanyId(int companyId)
        //{
        //    var result = await _timesheetService.GetTimesheetByCompanyId(companyId);

        //    if (result == null || !result.Any())
        //        return NotFound($"Timesheet for company {companyId} not found");

        //    return Ok(result);
        //}

        //[HttpGet("GetTimesheetByRoleAndCompanyId/{companyId}/{roleId}")]
        //public async Task<ActionResult<List<WeeklyTimesheet>>> GetTimesheetByRoleId(int companyId, int roleId)
        //{
        //    var result = await _timesheetService.GetTimesheetByRoleId(companyId, roleId);

        //    if (result == null || !result.Any())
        //        return NotFound($"Timesheet for companyId {companyId} and RoleId {roleId} not found");

        //    return Ok(result);
        //}





        [HttpPost("saveWeeklyTimesheet")]
        public async Task<IActionResult> SaveWeeklyTimesheets([FromBody] List<WeeklyTimesheet> timesheets)
        {
            if (timesheets == null || timesheets.Count == 0)
                return BadRequest(new { message = "Timesheet data is empty." });

            try
            {
                await _timesheetService.SaveTimesheetsAsync(timesheets);
                return Ok(new { message = "Timesheet saved successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred.", error = ex.Message });
            }
        }

        [HttpGet("getWeeklyTimesheets")]
        public async Task<IActionResult> GetWeeklyTimesheets()
        {
            try
            {
                var timesheets = await _timesheetService.GetTimesheetsAsync();
                return Ok(timesheets);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving timesheets.", error = ex.Message });
            }
        }

        [HttpPost("SaveTimesheetLeave")]
        public async Task<IActionResult> SaveOrUpdate([FromBody] TimesheetLeave leave)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                await _timesheetService.SaveOrUpdateLeaveAsync(leave);
                return Ok(new { message = "Leave saved successfully." });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { message = "Error saving leave", error = ex.Message });
            }
        }
        [HttpGet("GetAllTimesheetLeave")]
        public async Task<IActionResult> GetLeaves()
        {
            var leaves = await _timesheetService.GetLeavesAsync();
            return Ok(leaves);
        }


        // 🚀 NEW API : Get leave data for a specific month
        [HttpGet("getLeaveData/{month}")]
        public async Task<IActionResult> GetLeaveDataByMonth(string month)
        {
            if (string.IsNullOrWhiteSpace(month))
                return BadRequest(new { message = "Month is required." });

            try
            {
                var result = await _timesheetService.GetLeaveDataByMonthAsync(month);

                if (result == null)
                    return NotFound(new { message = $"Leave data not found for month: {month}" });

                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving leave data.", error = ex.Message });
            }
        }
        [HttpGet("GetAllWeeks")]
        public IActionResult GetAllWeeks()
        {
            var weeks = _timesheetService.GetAllWeeks();
            return Ok(weeks);
        }
        [HttpGet("GetWeekByDefault")]
        public async Task <IActionResult> GetWeekByDefault()
        {
            var currentweek = await _timesheetService.GetWeekByDefault();
            return Ok(currentweek);

        }

        [HttpPost("GetEmployeeByCompanyId")]
        public async Task<IActionResult> GetEmployeeByCompanyId([FromBody] FilterDto model)
        {
           
            if (model.CompanyId == null || model.CompanyId <= 0)
                return BadRequest(new { message = "Invalid CompanyId" });

           
            var employees = await _timesheetService.GetEmployeeByCompanyId(model.CompanyId.Value, model.EmpId);

           
            if (employees == null || !employees.Any())
                return NotFound(new { message = "No employees found" });


            return Ok(employees);
        }
        [HttpPost("GetEmployeeByRoleId")]
        public async Task<IActionResult> GetEmployeeByRoleId([FromBody] FilterDto model)
        {
            if (model.RoleId == null || model.RoleId <= 0)
                return BadRequest(new { message = "Invalid RoleId" });

            var timesheets = await _timesheetService .GetEmployeeByRoleId(model.CompanyId.Value, model.RoleId.Value);

            if (timesheets == null || !timesheets.Any())
                return NotFound(new { message = "No timesheet records found" });

            return Ok(timesheets);
        }
        //[HttpPost("SubmitTimesheet")]

        //public async Task<IActionResult> SaveEmployeeTimesheet([FromBody] List<WeeklyTimesheet> timesheets)
        //{
        //    if (timesheets == null || timesheets.Count == 0)
        //        return BadRequest(new { message = "Timesheet data is empty." });

        //    try
        //    {
        //        await _timesheetService.SubmitTimesheetAsync(timesheets);
        //        return Ok(new { message = "Timesheet submit successfully" });
        //    }
        //    catch (Exception ex)
        //    {
        //        return StatusCode(500, new { message = "An unexpected error occurred.", error = ex.Message });
        //    }
        //}

    }
}