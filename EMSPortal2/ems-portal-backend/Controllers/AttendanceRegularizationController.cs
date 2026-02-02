using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service.Interface;
using POCEmployeePortal.Services;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceRegularizationController : Controller
    {
        private readonly IAttendanceRegularizationService _attendanceRegularizationService;
        private readonly POCEmployeePortalContext _db;

        public AttendanceRegularizationController(IAttendanceRegularizationService attendanceRegularizationService, POCEmployeePortalContext db)
        {
            _attendanceRegularizationService = attendanceRegularizationService;
            _db = db;
        }

        [HttpGet("GetAllAttendanceRegularizations")]
        public IActionResult GetAllAttendanceRegularizations()
        {
            return Ok(_attendanceRegularizationService.GetAllAttendanceRegularizations());
        }

        [HttpGet("GetAttendanceRegularization/{id}")]
        public IActionResult GetAttendanceRegularization(int id)
        {
            return Ok(_attendanceRegularizationService.GetAttendanceRegularizationById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveAttendanceRegularization([FromBody] AttendanceRegularization attendanceRegularization)
        {
            return Ok(_attendanceRegularizationService.SaveAttendanceRegularization(attendanceRegularization));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteAttendanceRegularization(int id)
        {
            return Ok(_attendanceRegularizationService.DeleteAttendanceRegularization(id));
        }

        [HttpGet("GetAttendanceRegularizationByEmpId/{id}")]
        public IActionResult GetAttendanceEmp(string id)
        {
            return Ok(_attendanceRegularizationService.GetAttendanceRegularizationByEmpId(id));
        }

    }
}