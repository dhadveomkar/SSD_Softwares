using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class DailyTaskService : IDailyTaskService
    {
        private readonly IDailyTaskRepository _dailyTaskRepo;

        public DailyTaskService(IDailyTaskRepository dailyTaskRepo)
        {
            _dailyTaskRepo = dailyTaskRepo;
        }

        public IEnumerable<DailyTask> GetDailyTasks()
        {
            return _dailyTaskRepo.GetDailyTasks();
        }

        public DailyTask GetDailyTaskById(int id)
        {
            return _dailyTaskRepo.GetDailyTaskById(id);
        }

        //public DailyTask SaveDailyTask(DailyTask dailyTask)
        //{
        //    return _dailyTaskRepo.SaveDailyTask(dailyTask);
        //}

        public List<DailyTask> SaveDailyTask(List<DailyTask> dailyTasks)
        {
            if (dailyTasks == null || !dailyTasks.Any())
            {
                return new List<DailyTask>();
            }

            // Optional: Add business validation logic here
            // Example: Validate all tasks before saving
            foreach (var task in dailyTasks)
            {
                if (string.IsNullOrEmpty(task.EmpId))
                {
                    throw new ArgumentException("EmpId is required for all tasks");
                }
                // Add other validations as needed
            }

            return _dailyTaskRepo.SaveDailyTask(dailyTasks);
        }

        public DailyTask DeleteDailyTask(int id)
        {
            return _dailyTaskRepo.DeleteDailyTask(id);
        }

        public IEnumerable<DailyTask> GetDailyTaskByEmpId(string id)
        {
            return _dailyTaskRepo.GetDailyTaskByEmpId(id);
        }

        public async Task UploadDailyTaskExcelAsync(IFormFile file)
        {
            await _dailyTaskRepo.UploadDailyTaskExcelAsync(file);
        }

    }
}
