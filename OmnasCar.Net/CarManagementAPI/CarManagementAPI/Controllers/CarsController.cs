using CarManagementAPI.Models;
using CarManagementAPI.Repositories;

using Microsoft.AspNetCore.Mvc;


[Route("api/[controller]")]
[ApiController]
public class CarsController : ControllerBase
{
    private readonly ICarRepository _repository;

    public CarsController(ICarRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> Get() => Ok(await _repository.GetAllCarsAsync());

    [HttpPost]
    public async Task<IActionResult> Post(Car car)
    {
        var result = await _repository.CreateCarAsync(car);
        // Returns 201 Created instead of 200 OK
        return CreatedAtAction(nameof(Get), new { id = car.CarID }, car);
    }

    [HttpPut]
    public async Task<IActionResult> Put(Car car)
    {
        await _repository.UpdateCarAsync(car);
        return Ok(new { message = "Car updated successfully" });
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _repository.DeleteCarAsync(id);
        return Ok(new { message = "Car deleted successfully" });
    }
}