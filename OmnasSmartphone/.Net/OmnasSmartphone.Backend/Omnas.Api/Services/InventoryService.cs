using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Omnas.Api.Data;
using Omnas.Api.Models;

namespace Omnas.Api.Services
{
    public interface IInventoryService
    {
        Task<List<SmartphoneDevice>> GetSmartphonesAsync();
        Task<List<WearableDevice>> GetWearablesAsync();
        Task<List<TabletDevice>> GetTabletsAsync();

        Task<bool> AddSmartphoneAsync(SmartphoneDevice device);
        Task<bool> AddTabletAsync(TabletDevice device);
        Task<bool> AddWearableAsync(WearableDevice device);

        // Inside IInventoryService interface
        Task<bool> UpdateDeviceAsync(string category, int id, SmartphoneDevice device);
        Task<bool> DeleteDeviceAsync(string category, int id);
        // Add this line:
        Task<List<SmartphoneDevice>> GetAllDevicesAsync();
    }

    public class InventoryService : IInventoryService
    {
        private readonly BackendDbContext _context;

        public InventoryService(BackendDbContext context)
        {
            _context = context;
        }

        // --- GET METHODS (Stored Procedures) ---
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

        // --- ADD METHODS (Entity Framework) ---
        public async Task<bool> AddSmartphoneAsync(SmartphoneDevice device)
        {
            _context.Devices.Add(device);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> AddTabletAsync(TabletDevice device)
        {
            _context.Set<TabletDevice>().Add(device);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> AddWearableAsync(WearableDevice device)
        {
            _context.Set<WearableDevice>().Add(device);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        // Inside InventoryService class implementation
        public async Task<bool> UpdateDeviceAsync(string category, int id, SmartphoneDevice updatedData)
        {
            var existing = await FindDeviceAsync(category, id);
            if (existing == null) return false;

            // Map updated fields
            existing.DeviceName = updatedData.DeviceName;
            existing.OSVersion = updatedData.OSVersion;
            existing.LastSync = DateTime.Now;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteDeviceAsync(string category, int id)
        {
            var device = await FindDeviceAsync(category, id);
            if (device == null) return false;

            _context.Remove(device);
            return await _context.SaveChangesAsync() > 0;
        }

        // Helper to find device across different sets
        private async Task<dynamic?> FindDeviceAsync(string category, int id)
        {
            return category.ToLower() switch
            {
                "smartphone" => await _context.Devices.FindAsync(id),
                "tablet" => await _context.Set<TabletDevice>().FindAsync(id),
                "wearable" => await _context.Set<WearableDevice>().FindAsync(id),
                _ => null
            };
        }

        public async Task<List<SmartphoneDevice>> GetAllDevicesAsync()
        {
            // 1. Fetch from all 3 existing tables
            var smartphones = await _context.Devices.ToListAsync();
            var tablets = await _context.Tablets.ToListAsync();
            var wearables = await _context.Wearables.ToListAsync();

            // 2. Map them to a common format (SmartphoneDevice) and combine
            var allDevices = smartphones
                .Concat(tablets.Select(t => new SmartphoneDevice
                {
                    Id = t.Id,
                    DeviceName = t.DeviceName,
                    OSVersion = t.OSVersion,
                    LastSync = t.LastSync
                }))
                .Concat(wearables.Select(w => new SmartphoneDevice
                {
                    Id = w.Id,
                    DeviceName = w.DeviceName,
                    OSVersion = w.OSVersion,
                    LastSync = w.LastSync
                }))
                .ToList();

            return allDevices;
        }
    }
}