using CarManagementAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsRepository _repo;
    public AnalyticsController(IAnalyticsRepository repo) => _repo = repo;

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        return Ok(await _repo.GetSummaryAsync());
    }
}