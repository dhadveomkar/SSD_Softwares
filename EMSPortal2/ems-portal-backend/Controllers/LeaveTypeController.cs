using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveTypeController : Controller
    {
        private readonly ILeaveTypeService _leaveTypeService;

        public LeaveTypeController(ILeaveTypeService leaveTypeService)
        {
            _leaveTypeService = leaveTypeService;
        }

        [HttpGet("GetAllLeaveTypes")]
        public IActionResult GetLeaveTypes()
        {
            return Ok(_leaveTypeService.GetLeaveTypes());
        }

        [HttpGet("GetLeaveType/{id}")]
        public IActionResult GetLeaveType(int id)
        {
            return Ok(_leaveTypeService.GetLeaveTypeById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveLeaveType([FromBody] LeaveType leaveType)
        {
            return Ok(_leaveTypeService.SaveLeaveType(leaveType));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteLeaveType(int id)
        {
            return Ok(_leaveTypeService.DeleteLeaveType(id));
        }
    }
}