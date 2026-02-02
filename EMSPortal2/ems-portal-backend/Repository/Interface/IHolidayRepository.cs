using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface IHolidayRepository
    {
        IEnumerable<Holiday> GetHolidays();
        Holiday GetHolidayById(int id);
        Holiday SaveHoliday(Holiday holiday);
        Holiday DeleteHoliday(int id);
    }
}
