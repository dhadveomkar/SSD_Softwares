using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Omnas.Api.Data;
using Omnas.Api.Models;

namespace Omnas.Api.Services // <--- Add this line
{
    public interface IInventoryService
    {
        Task<List<SmartphoneDevice>> GetSmartphonesAsync();
        Task<List<WearableDevice>> GetWearablesAsync();
        Task<List<TabletDevice>> GetTabletsAsync();
    }

    public class InventoryService : IInventoryService
    {
        private readonly BackendDbContext _context;

        public InventoryService(BackendDbContext context)
        {
            _context = context;
        }

        public async Task<List<SmartphoneDevice>> GetSmartphonesAsync()
        {
            return await _context.Devices.FromSqlRaw("EXEC sp_GetSmartphones").ToListAsync();
        }

        public async Task<List<WearableDevice>> GetWearablesAsync()
        {
            return await _context.Set<WearableDevice>().FromSqlRaw("EXEC sp_GetWearables").ToListAsync();
        }

        public async Task<List<TabletDevice>> GetTabletsAsync()
        {
            return await _context.Set<TabletDevice>().FromSqlRaw("EXEC sp_GetTablets").ToListAsync();
        }
    }
} // <--- Close the namespace block