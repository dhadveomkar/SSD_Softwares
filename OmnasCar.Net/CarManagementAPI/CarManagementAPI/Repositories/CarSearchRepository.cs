using CarManagementAPI.Models;
using CarManagementAPI.Repositories;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

public class CarSearchRepository : ICarSearchRepository
{
    private readonly string _connectionString;
    public CarSearchRepository(IConfiguration config) =>
        _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<IEnumerable<Car>> SearchCarsAsync(CarSearchCriteria criteria)
    {
        using var db = new SqlConnection(_connectionString);
        // Dapper maps the properties of 'criteria' directly to the @parameters in the SP
        return await db.QueryAsync<Car>("sp_SearchCars", criteria,
            commandType: CommandType.StoredProcedure);
    }
}
