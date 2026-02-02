using CarManagementAPI.Models;
using CarManagementAPI.Repositories;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

public class MaintenanceRepository : IMaintenanceRepository
{
    private readonly string _connectionString;
    public MaintenanceRepository(IConfiguration config) =>
        _connectionString = config.GetConnectionString("DefaultConnection")!;

    private IDbConnection Connection => new SqlConnection(_connectionString);

    public async Task<IEnumerable<MaintenanceLog>> GetLogsByCarIdAsync(int carId)
    {
        using var db = Connection;
        return await db.QueryAsync<MaintenanceLog>("sp_GetMaintenanceByCarId",
            new { CarId = carId }, commandType: CommandType.StoredProcedure);
    }

    public async Task<int> AddLogAsync(MaintenanceLog log)
    {
        using var db = Connection;
        var p = new DynamicParameters();
        p.Add("@CarId", log.CarID);
        p.Add("@ServiceDate", log.ServiceDate);
        p.Add("@Description", log.Description);
        p.Add("@Cost", log.Cost);
        return await db.ExecuteAsync("sp_InsertMaintenanceLog", p, commandType: CommandType.StoredProcedure);
    }
}