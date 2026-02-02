using CarManagementAPI.Models;

namespace CarManagementAPI.Repositories
{
    public interface ICarSearchRepository
    {
        Task<IEnumerable<Car>> SearchCarsAsync(CarSearchCriteria criteria);
    }
}
