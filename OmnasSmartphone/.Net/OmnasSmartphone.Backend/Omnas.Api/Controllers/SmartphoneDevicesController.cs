using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Omnas.Api.Data;
using Omnas.Api.Models;

namespace Omnas.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SmartphoneDevicesController : ControllerBase
    {
        private readonly BackendDbContext _context;

        public SmartphoneDevicesController(BackendDbContext context)
        {
            _context = context;
        }

        // GET: api/SmartphoneDevices
        [HttpGet]
        public async Task<ActionResult<IEnumerable<SmartphoneDevice>>> GetDevices()
        {
            return await _context.Devices.ToListAsync();
        }

        // POST: api/SmartphoneDevices
        [HttpPost]
        public async Task<ActionResult<SmartphoneDevice>> PostDevice(SmartphoneDevice device)
        {
            _context.Devices.Add(device);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetDevices), new { id = device.Id }, device);
        }
    }
}

