using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class LeaveCountController : ControllerBase
    {
        private readonly ILeaveCountService _leaveCountService;

        public LeaveCountController(ILeaveCountService leaveCountService)
        {
            _leaveCountService = leaveCountService;
        }

        [HttpGet("GetAllLeaveCount")]
        public IActionResult GetAll()
        {
            var result = _leaveCountService.GetAll();
            return Ok(result);
        }

        [HttpGet("{typeOfLeaveRequest}/{companyName}")]
        public IActionResult GetById(String typeOfLeaveRequest, string companyName)
        {
            var result = _leaveCountService.GetById(typeOfLeaveRequest, companyName);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpPost]
        public IActionResult Add([FromBody] LeaveCount leaveCount)
        {
            _leaveCountService.Add(leaveCount);
            return Ok();
        }

        [HttpPut]
        public IActionResult Update([FromBody] LeaveCount leaveCount)
        {
            _leaveCountService.Update(leaveCount);
            return Ok();
        }

        [HttpDelete("{typeOfLeaveRequest}/{companyName}")]
        public IActionResult Delete(string typeOfLeaveRequest, string companyName)
        {
            _leaveCountService.Delete(typeOfLeaveRequest, companyName);
            return Ok();
        }
    }
}