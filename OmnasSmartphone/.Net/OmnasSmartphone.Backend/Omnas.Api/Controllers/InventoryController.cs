using Microsoft.AspNetCore.Mvc;
using Omnas.Api.Models;
using Omnas.Api.Services;
using System.Text.Json;

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

        // POST: api/Inventory/add?category=smartphone
        [HttpPost("add")]
        public async Task<IActionResult> AddDevice([FromQuery] string category, [FromBody] JsonElement deviceData)
        {
            try
            {
                if (string.IsNullOrEmpty(category))
                    return BadRequest("Category is required (smartphone, wearable, or tablet).");

                bool success = false;
                string jsonString = deviceData.GetRawText();

                switch (category.ToLower())
                {
                    case "smartphone":
                        var phone = JsonSerializer.Deserialize<SmartphoneDevice>(jsonString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (phone != null) success = await _inventoryService.AddSmartphoneAsync(phone);
                        break;

                    case "tablet":
                        var tablet = JsonSerializer.Deserialize<TabletDevice>(jsonString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (tablet != null) success = await _inventoryService.AddTabletAsync(tablet);
                        break;

                    case "wearable":
                        var wearable = JsonSerializer.Deserialize<WearableDevice>(jsonString, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                        if (wearable != null) success = await _inventoryService.AddWearableAsync(wearable);
                        break;

                    default:
                        return BadRequest($"Category '{category}' is not supported.");
                }

                if (success)
                    return Ok(new { message = $"{category} added successfully!" });

                return BadRequest("Failed to save the device to the database.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

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
                        return Ok(await _inventoryService.GetSmartphonesAsync());
                    case "wearable":
                        return Ok(await _inventoryService.GetWearablesAsync());
                    case "tablet":
                        return Ok(await _inventoryService.GetTabletsAsync());
                    default:
                        return NotFound($"Category '{category}' not found.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        // PUT: api/Inventory/update/smartphone/5
        [HttpPut("update/{category}/{id}")]
        public async Task<IActionResult> Update(string category, int id, [FromBody] SmartphoneDevice device)
        {
            var success = await _inventoryService.UpdateDeviceAsync(category, id, device);
            return success ? Ok(new { message = "Updated successfully" }) : NotFound();
        }

        // DELETE: api/Inventory/delete/smartphone/5
        [HttpDelete("delete/{category}/{id}")]
        public async Task<IActionResult> Delete(string category, int id)
        {
            var success = await _inventoryService.DeleteDeviceAsync(category, id);
            return success ? Ok(new { message = "Deleted successfully" }) : NotFound();
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllDevices(string? sortBy = "name", string? order = "asc")
        {
            var devices = await _inventoryService.GetAllDevicesAsync();

            // Sorting Logic
            if (sortBy == "name")
            {
                devices = order == "desc" ? devices.OrderByDescending(d => d.DeviceName).ToList() : devices.OrderBy(d => d.DeviceName).ToList();
            }
            else if (sortBy == "date")
            {
                devices = order == "desc" ? devices.OrderByDescending(d => d.LastSync).ToList() : devices.OrderBy(d => d.LastSync).ToList();
            }

            return Ok(devices);
        }
    }
}