using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class HolidayRepository : IHolidayRepository
    {
        private readonly POCEmployeePortalContext _db;

        public HolidayRepository(POCEmployeePortalContext db)
        {
            _db = db;
        }

        public IEnumerable<Holiday> GetHolidays()
        {
            return _db.Holidays.ToList();
        }

        public Holiday GetHolidayById(int id)
        {
            return _db.Holidays.FirstOrDefault(h => h.HolidayId == id);
        }

        public Holiday SaveHoliday(Holiday holiday)
        {
            if (holiday == null)
                return null;

            if (holiday.HolidayId > 0)
            {
                // Update existing holiday
                var existingHoliday = _db.Holidays.Find(holiday.HolidayId);
                if (existingHoliday != null)
                {
                    existingHoliday.Date = holiday.Date;
                    existingHoliday.Name = holiday.Name;
                    existingHoliday.Description = holiday.Description;
                    existingHoliday.Type = holiday.Type;
                    existingHoliday.HolidaySet = holiday.HolidaySet;

                    _db.SaveChanges();
                    return holiday;
                }
            }

            // Add new holiday
            _db.Holidays.Add(holiday);
            _db.SaveChanges();

            return holiday;
        }

        public Holiday DeleteHoliday(int id)
        {
            var holiday = _db.Holidays.Find(id);
            if (holiday != null)
            {
                _db.Holidays.Remove(holiday);
                _db.SaveChanges();
                return holiday;
            }
            return null;
        }
    }
}