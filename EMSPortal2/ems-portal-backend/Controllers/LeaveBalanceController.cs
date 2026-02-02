using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveBalanceController : Controller
    {
        private readonly ILeaveBalanceService _leaveBalanceService;

        public LeaveBalanceController(ILeaveBalanceService leaveBalanceService)
        {
            _leaveBalanceService = leaveBalanceService;
        }

        [HttpGet("GetAllLeaveBalances")]
        public IActionResult GetLeaveBalances()
        {
            return Ok(_leaveBalanceService.GetLeaveBalances());
        }

        [HttpGet("GetLeaveBalance/{id}")]
        public IActionResult GetLeaveBalance(int id)
        {
            return Ok(_leaveBalanceService.GetLeaveBalanceById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveLeaveBalance([FromBody] LeaveBalance leaveBalance)
        {
            return Ok(_leaveBalanceService.SaveLeaveBalance(leaveBalance));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteLeaveBalance(int id)
        {
            return Ok(_leaveBalanceService.DeleteLeaveBalance(id));
        }
    }
}