using Microsoft.AspNetCore.Mvc;
using Omnas.Api.Models;
using Omnas.Api.Services; // This will now work because of the namespace above

namespace Omnas.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class InventoryController : ControllerBase
    {
        private readonly IInventoryService _inventoryService;

        public InventoryController(IInventoryService inventoryService)
        {
            _inventoryService = inventoryService;
        }

        [HttpGet("live-data")]
        public async Task<IActionResult> GetLiveData()
        {
            var phones = await _inventoryService.GetSmartphonesAsync();
            var watches = await _inventoryService.GetWearablesAsync();
            var tablets = await _inventoryService.GetTabletsAsync();

            return Ok(new { Smartphones = phones, Wearables = watches, Tablets = tablets });
        }

        // GET: api/Inventory/filter?category=Smartphone
        [HttpGet("filter")]
        public async Task<IActionResult> GetFilteredData([FromQuery] string category)
        {
            try
            {
                if (string.IsNullOrEmpty(category))
                    return BadRequest("Category is required (Smartphone, Wearable, or Tablet)");

                switch (category.ToLower())
                {
                    case "smartphone":
                        var phones = await _inventoryService.GetSmartphonesAsync();
                        return Ok(phones);
                    case "wearable":
                        var watches = await _inventoryService.GetWearablesAsync();
                        return Ok(watches);
                    case "tablet":
                        var tablets = await _inventoryService.GetTabletsAsync();
                        return Ok(tablets);
                    default:
                        return NotFound($"Category '{category}' not found.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}