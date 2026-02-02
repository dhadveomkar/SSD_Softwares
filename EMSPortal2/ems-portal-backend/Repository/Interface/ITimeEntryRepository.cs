using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface ITimeEntryRepository
    {
        IEnumerable<TimeEntry> GetAllTimeEntries();
        TimeEntry GetTimeEntryById(int id);
        TimeEntry SaveTimeEntry(TimeEntry timeEntry);
        TimeEntry DeleteTimeEntry(int id);
    }
}