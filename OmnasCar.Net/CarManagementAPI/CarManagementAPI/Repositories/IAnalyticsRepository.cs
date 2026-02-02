using CarManagementAPI.Models;

namespace CarManagementAPI.Repositories
{
    public interface IAnalyticsRepository
    {
        Task<DashboardSummary> GetSummaryAsync();
    }
}
