using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface IHolidayService
    {
        IEnumerable<Holiday> GetHolidays();
        Holiday GetHolidayById(int id);
        Holiday SaveHoliday(Holiday holiday);
        Holiday DeleteHoliday(int id);
    }
}
