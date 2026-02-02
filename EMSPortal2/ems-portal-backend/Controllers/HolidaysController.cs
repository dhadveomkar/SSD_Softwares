using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class HolidaysController : Controller
    {
        private readonly IHolidayService _holidaysService;
        private readonly POCEmployeePortalContext _db;

        public HolidaysController(IHolidayService holidaysService, POCEmployeePortalContext db)
        {
            _holidaysService = holidaysService;
            _db = db;
        }

        [HttpGet("GetAllHolidays")]
        public IActionResult GetHolidays()
        {
            return Ok(_holidaysService.GetHolidays());
        }

        [HttpGet("GetHoliday/{id}")]
        public IActionResult GetHoliday(int id)
        {
            return Ok(_holidaysService.GetHolidayById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveHoliday([FromBody] Holiday holiday)
        {
            return Ok(_holidaysService.SaveHoliday(holiday));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteHoliday(int id)
        {
            return Ok(_holidaysService.DeleteHoliday(id));
        }
    }
}