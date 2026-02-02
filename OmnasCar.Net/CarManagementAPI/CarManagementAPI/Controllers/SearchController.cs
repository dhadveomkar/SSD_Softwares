using CarManagementAPI.Models;
using CarManagementAPI.Repositories;
using Microsoft.AspNetCore.Mvc;

[Route("api/[controller]")]
[ApiController]
public class SearchController : ControllerBase
{
    private readonly ICarSearchRepository _repo;
    public SearchController(ICarSearchRepository repo) => _repo = repo;

    [HttpGet]
    public async Task<IActionResult> Search([FromQuery] CarSearchCriteria criteria)
    {
        var results = await _repo.SearchCarsAsync(criteria);
        return Ok(results);
    }
}