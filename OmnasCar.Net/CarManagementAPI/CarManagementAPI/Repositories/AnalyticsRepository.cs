using CarManagementAPI.Models;
using CarManagementAPI.Repositories;
using Microsoft.Data.SqlClient;
using System.Data;
using Dapper; // <--- Add this line

public class AnalyticsRepository : IAnalyticsRepository
{
    private readonly string _connectionString;
    public AnalyticsRepository(IConfiguration config) =>
        _connectionString = config.GetConnectionString("DefaultConnection")!;

    public async Task<DashboardSummary> GetSummaryAsync()
    {
        using var db = new SqlConnection(_connectionString);
        using var multi = await db.QueryMultipleAsync("sp_GetDashboardSummary", commandType: CommandType.StoredProcedure);

        var summary = await multi.ReadFirstAsync<DashboardSummary>();
        summary.CarsByCategory = (await multi.ReadAsync<CategoryCount>()).ToList();
        summary.MostExpensiveCar = await multi.ReadFirstOrDefaultAsync<Car>();

        return summary;
    }
}