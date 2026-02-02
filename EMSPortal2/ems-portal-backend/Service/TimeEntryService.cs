using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class TimeEntryService : ITimeEntryService
    {
        private readonly ITimeEntryRepository _repository;

        public TimeEntryService(ITimeEntryRepository repository)
        {
            _repository = repository;
        }

        public IEnumerable<TimeEntry> GetAllTimeEntries()
            => _repository.GetAllTimeEntries();

        public TimeEntry GetTimeEntryById(int id)
            => _repository.GetTimeEntryById(id);

        public TimeEntry SaveTimeEntry(TimeEntry timeEntry)
            => _repository.SaveTimeEntry(timeEntry);

        public TimeEntry DeleteTimeEntry(int id)
            => _repository.DeleteTimeEntry(id);
    }
}