using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DailyTaskController : Controller
    {
        private readonly IDailyTaskService _dailyTaskService;
        private readonly POCEmployeePortalContext _db;

        public DailyTaskController(IDailyTaskService dailyTaskService, POCEmployeePortalContext db)
        {
            _dailyTaskService = dailyTaskService;
            _db = db;
        }

        [HttpGet("GetAllDailyTasks")]
        public IActionResult GetDailyTasks()
        {
            return Ok(_dailyTaskService.GetDailyTasks());
        }

        [HttpGet("GetDailyTask/{id}")]
        public IActionResult GetDailyTask(int id)
        {
            return Ok(_dailyTaskService.GetDailyTaskById(id));
        }

        //[HttpPost("Save")]
        //public IActionResult SaveDailyTask([FromBody] DailyTask dailyTask)
        //{
        //    return Ok(_dailyTaskService.SaveDailyTask(dailyTask));
        //}

        [HttpPost("Save")]
        public IActionResult SaveDailyTasks([FromBody] List<DailyTask> dailyTasks)
        {
             var results = _dailyTaskService.SaveDailyTask(dailyTasks);
    return Ok(results);
        }

        [HttpPost("upload-DailyTaskExcel")]
        public async Task<IActionResult> UploadExcel(IFormFile file)
        {
            try
            {
                await _dailyTaskService.UploadDailyTaskExcelAsync(file);
                return Ok(new { Message = "Excel data uploaded successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteDailyTask(int id)
        {
            return Ok(_dailyTaskService.DeleteDailyTask(id));
        }

        [HttpGet("GetDailyTaskByEmpId/{id}")]
        public IActionResult GetDailyTaskEmp(string id)
        {
            return Ok(_dailyTaskService.GetDailyTaskByEmpId(id));
        }
    }
}
