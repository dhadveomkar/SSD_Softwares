using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;
using POCEmployeePortal.Services;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveRequestController : Controller
    {
        private readonly ILeaveRequestService _LeaveRequestService;

        public LeaveRequestController(ILeaveRequestService LeaveRequestService)
        {
            _LeaveRequestService = LeaveRequestService;
        }

        [HttpGet("GetAllLeaveRequests")]
        public IActionResult GetLeaveRequests()
        {
            return Ok(_LeaveRequestService.GetLeaveRequests());
        }

        [HttpGet("GetLeaveRequest/{id}")]
        public IActionResult GetLeaveRequest(int id)
        {
            return Ok(_LeaveRequestService.GetLeaveRequestById(id));
        }


        [AllowAnonymous]
        [HttpGet("Approve/{applicationId}")]
        public IActionResult ApproveLeaveRequest(int applicationId)
        {
            try
            {
                _LeaveRequestService.UpdateLeaveStatus(applicationId, "Approved");
                return Content("<h2 style='text-align:center;color:green;'>✅ Leave Approved Successfully!</h2>", "text/html");
            }
            catch (Exception ex)
            {
                return Content($"<h2 style='text-align:center;color:red;'>❌ Error: {ex.Message}</h2>", "text/html");
            }
        }

        [AllowAnonymous]
        [HttpGet("Reject/{applicationId}")]
        public IActionResult RejectLeaveRequest(int applicationId)
        {
            try
            {
                _LeaveRequestService.UpdateLeaveStatus(applicationId, "Rejected");
                return Content("<h2 style='text-align:center;color:red;'>🚫 Leave Rejected Successfully!</h2>", "text/html");
            }
            catch (Exception ex)
            {
                return Content($"<h2 style='text-align:center;color:red;'>❌ Error: {ex.Message}</h2>", "text/html");
            }
        }

        [HttpPost("Save")]
        public IActionResult SaveLeaveRequest([FromBody] LeaveRequest LeaveRequest)
        {
            return Ok(_LeaveRequestService.SaveLeaveRequest(LeaveRequest));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteLeaveRequest(int id)
        {
            return Ok(_LeaveRequestService.DeleteLeaveRequest(id));
        }


        [HttpGet("GetLeaveRequestByEmpId/{id}")]
        public IActionResult GetLeaveRequestEmp(string id)
        {
            return Ok(_LeaveRequestService.GetLeaveRequestByEmpId(id));
        }
    }
}