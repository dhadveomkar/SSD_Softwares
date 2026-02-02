using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class TimeEntryRepository : ITimeEntryRepository
    {
        private readonly POCEmployeePortalContext _db;

        public TimeEntryRepository(POCEmployeePortalContext db)
        {
            _db = db;
        }

        public IEnumerable<TimeEntry> GetAllTimeEntries()
            => _db.TimeEntries.ToList();

        public TimeEntry GetTimeEntryById(int id)
            => _db.TimeEntries.FirstOrDefault(t => t.EntryId == id);

        public TimeEntry SaveTimeEntry(TimeEntry timeEntry)
        {
            if (timeEntry == null) return null;

            if (timeEntry.EntryId > 0)
            {
                // Update existing record
                var existing = _db.TimeEntries.Find(timeEntry.EntryId);
                if (existing != null)
                {
                    existing.EmpId = timeEntry.EmpId;
                    existing.ProjectTaskId = timeEntry.ProjectTaskId;
                    existing.Date = timeEntry.Date;
                    existing.Hours = timeEntry.Hours;
                    existing.Description = timeEntry.Description;
                }
            }
            else
            {
                // Insert new record
                _db.TimeEntries.Add(timeEntry);
            }

            _db.SaveChanges();
            return timeEntry;
        }

        public TimeEntry DeleteTimeEntry(int id)
        {
            var timeEntry = _db.TimeEntries.Find(id);
            if (timeEntry != null)
            {
                _db.TimeEntries.Remove(timeEntry);
                _db.SaveChanges();
            }
            return timeEntry;
        }
    }
}