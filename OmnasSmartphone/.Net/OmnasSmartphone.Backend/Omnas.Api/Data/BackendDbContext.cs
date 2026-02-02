using Microsoft.EntityFrameworkCore;
using Omnas.Api.Models;

namespace Omnas.Api.Data
{
    public class BackendDbContext : DbContext
    {
        public BackendDbContext(DbContextOptions<BackendDbContext> options) : base(options) { }

        public DbSet<SmartphoneDevice> Devices { get; set; }

    }
}
