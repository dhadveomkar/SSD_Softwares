using CarManagementAPI.Models;
using Dapper;
using Microsoft.Data.SqlClient;
using System.Data;

namespace CarManagementAPI.Repositories
{
    public class CategoryRepository : ICategoryRepository
    {
        private readonly string _connectionString;
        public CategoryRepository(IConfiguration config)
        {
            _connectionString = config.GetConnectionString("DefaultConnection")!;
        }

        private IDbConnection CreateConnection() => new SqlConnection(_connectionString);

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            using var db = CreateConnection();
            // Using a simple query here, but you could also use a Stored Procedure
            return await db.QueryAsync<Category>("SELECT * FROM Categories");
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            using var db = CreateConnection();
            return await db.QueryFirstOrDefaultAsync<Category>(
                "SELECT * FROM Categories WHERE CategoryID = @Id", new { Id = id });
        }
    }
}