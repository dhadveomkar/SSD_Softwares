using CarManagementAPI.Models;
using CarManagementAPI.Repositories;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

public class CarRepository : ICarRepository
{
    private readonly string _connectionString;
    public CarRepository(IConfiguration config)
    {
        _connectionString = config.GetConnectionString("DefaultConnection")!;
    }

    private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

    public async Task<IEnumerable<Car>> GetAllCarsAsync()
    {
        using var db = CreateConnection();
        return await db.QueryAsync<Car>("sp_GetAllCars", commandType: CommandType.StoredProcedure);
    }

    public async Task<int> CreateCarAsync(Car car)
    {
        using var db = CreateConnection();
        var p = new DynamicParameters();
        p.Add("@ModelName", car.ModelName);
        p.Add("@Brand", car.Brand);
        p.Add("@Year", car.Year);
        p.Add("@Price", car.Price);
        p.Add("@CategoryID", car.CategoryID);
        return await db.ExecuteAsync("sp_InsertCar", p, commandType: CommandType.StoredProcedure);
    }

    // FIX: Implementing the missing Update method
    public async Task<int> UpdateCarAsync(Car car)
    {
        using var db = CreateConnection();
        var p = new DynamicParameters();
        p.Add("@CarID", car.CarID);
        p.Add("@ModelName", car.ModelName);
        p.Add("@Brand", car.Brand);
        p.Add("@Year", car.Year);
        p.Add("@Price", car.Price);
        p.Add("@CategoryID", car.CategoryID);
        return await db.ExecuteAsync("sp_UpdateCar", p, commandType: CommandType.StoredProcedure);
    }

    // FIX: Implementing the missing Delete method
    public async Task<int> DeleteCarAsync(int id)
    {
        using var db = CreateConnection();
        return await db.ExecuteAsync("sp_DeleteCar", new { CarId = id }, commandType: CommandType.StoredProcedure);
    }
}