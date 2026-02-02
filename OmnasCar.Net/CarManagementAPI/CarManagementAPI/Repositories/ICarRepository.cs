using CarManagementAPI.Models;

namespace CarManagementAPI.Repositories
{
    public interface ICarRepository
    {
        Task<IEnumerable<Car>> GetAllCarsAsync();
        Task<int> CreateCarAsync(Car car);
        Task<int> UpdateCarAsync(Car car);
        Task<int> DeleteCarAsync(int id);
    }
}
