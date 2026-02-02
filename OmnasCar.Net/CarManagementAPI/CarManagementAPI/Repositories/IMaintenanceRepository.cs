using CarManagementAPI.Models;

namespace CarManagementAPI.Repositories
{
    public interface IMaintenanceRepository
    {
        Task<IEnumerable<MaintenanceLog>> GetLogsByCarIdAsync(int carId);
        Task<int> AddLogAsync(MaintenanceLog log);
    }
}
