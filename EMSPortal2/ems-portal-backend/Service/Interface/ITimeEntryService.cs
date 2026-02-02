using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface ITimeEntryService
    {
        IEnumerable<TimeEntry> GetAllTimeEntries();
        TimeEntry GetTimeEntryById(int id);
        TimeEntry SaveTimeEntry(TimeEntry timeEntry);
        TimeEntry DeleteTimeEntry(int id);
    }
}