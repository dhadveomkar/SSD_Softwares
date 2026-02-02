using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface IDailyTaskRepository
    {
        IEnumerable<DailyTask> GetDailyTasks();
        DailyTask GetDailyTaskById(int id);

        //DailyTask SaveDailyTask(DailyTask dailyTask);

        Task UploadDailyTaskExcelAsync(IFormFile file);
        List<DailyTask> SaveDailyTask(List<DailyTask> dailyTasks);
        DailyTask DeleteDailyTask(int id);
        IEnumerable<DailyTask> GetDailyTaskByEmpId(string id);
    }
}
