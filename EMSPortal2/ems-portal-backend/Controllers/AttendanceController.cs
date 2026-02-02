using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AttendanceController : Controller
    {
        private readonly IAttendanceService _attendanceService;
        private readonly POCEmployeePortalContext _db;

        public AttendanceController(IAttendanceService attendanceService, POCEmployeePortalContext db)
        {
            _attendanceService = attendanceService;
            _db = db;
        }

        [HttpGet("GetAllAttendances")]
        public IActionResult GetAttendances()
        {
            return Ok(_attendanceService.GetAttendances());
        }

        [HttpGet("GetAttendance/{id}")]
        public IActionResult GetAttendance(int id)
        {
            return Ok(_attendanceService.GetAttendanceById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveAttendance([FromBody] Attendance attendance)
        {
            return Ok(_attendanceService.SaveAttendance(attendance));
        }
       
        [HttpGet("Delete/{id}")]
        public IActionResult DeleteAttendance(int id)
        {
            return Ok(_attendanceService.DeleteAttendance(id));
        }

        [HttpGet("GetAttendanceByEmpId/{id}")]
        public IActionResult GetAttendanceEmp(string id)
        {
            return Ok(_attendanceService.GetAttendanceByEmpId(id));
        }

    }
}