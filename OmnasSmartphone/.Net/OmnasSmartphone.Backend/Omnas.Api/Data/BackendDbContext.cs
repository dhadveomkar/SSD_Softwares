using Microsoft.EntityFrameworkCore;
using Omnas.Api.Models;

namespace Omnas.Api.Data
{
    public class BackendDbContext : DbContext
    {
        public BackendDbContext(DbContextOptions<BackendDbContext> options) : base(options)
        {
        }
        
        // Your existing Smartphone table
        public DbSet<SmartphoneDevice> Devices { get; set; }

        // Add these for the new inventory sections
        public DbSet<WearableDevice> Wearables { get; set; }
        public DbSet<TabletDevice> Tablets { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // If Wearables/Tablets don't have a physical table yet, 
            // we tell EF they are 'Keyless' or mapped to the SP result structure
            // However, since we created tables in SQL, these standard DbSets will work.
        }
    }
}