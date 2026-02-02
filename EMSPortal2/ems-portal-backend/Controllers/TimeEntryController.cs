using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TimeEntryController : Controller
    {
        private readonly ITimeEntryService _timeEntryService;

        public TimeEntryController(ITimeEntryService timeEntryService)
        {
            _timeEntryService = timeEntryService;
        }

        [HttpGet("GetAllTimeEntries")]
        public IActionResult GetAllTimeEntries()
        {
            return Ok(_timeEntryService.GetAllTimeEntries());
        }

        [HttpGet("GetTimeEntry/{id}")]
        public IActionResult GetTimeEntry(int id)
        {
            return Ok(_timeEntryService.GetTimeEntryById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveTimeEntry([FromBody] TimeEntry timeEntry)
        {
            return Ok(_timeEntryService.SaveTimeEntry(timeEntry));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteTimeEntry(int id)
        {
            return Ok(_timeEntryService.DeleteTimeEntry(id));
        }
    }
}