using CarManagementAPI.Models;
using CarManagementAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class MaintenanceController : ControllerBase
{
    private readonly IMaintenanceRepository _repo;
    public MaintenanceController(IMaintenanceRepository repo) => _repo = repo;

    [HttpGet("car/{carId}")]
    public async Task<IActionResult> GetLogs(int carId) =>
        Ok(await _repo.GetLogsByCarIdAsync(carId));

    [HttpPost]
    public async Task<IActionResult> Post(MaintenanceLog log)
    {
        await _repo.AddLogAsync(log);
        return Ok(new { message = "Maintenance log added" });
    }
}
