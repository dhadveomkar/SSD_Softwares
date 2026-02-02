using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Services
{
    public class HolidayService : IHolidayService
    {
        private readonly IHolidayRepository _holidaysRepo;

        public HolidayService(IHolidayRepository holidaysRepo)
        {
            _holidaysRepo = holidaysRepo;
        }

        public IEnumerable<Holiday> GetHolidays()
        {
            return _holidaysRepo.GetHolidays();
        }

        public Holiday GetHolidayById(int id)
        {
            return _holidaysRepo.GetHolidayById(id);
        }

        public Holiday SaveHoliday(Holiday holiday)
        {
            return _holidaysRepo.SaveHoliday(holiday);
        }

        public Holiday DeleteHoliday(int id)
        {
            return _holidaysRepo.DeleteHoliday(id);
        }
    }
}