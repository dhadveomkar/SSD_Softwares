using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface IDailyTaskService
    {
        IEnumerable<DailyTask> GetDailyTasks();

        Task UploadDailyTaskExcelAsync(IFormFile file);
        DailyTask GetDailyTaskById(int id);
        //DailyTask SaveDailyTask(DailyTask dailyTask);

        List<DailyTask> SaveDailyTask(List<DailyTask> dailyTasks);
        DailyTask DeleteDailyTask(int id);
        IEnumerable<DailyTask> GetDailyTaskByEmpId(string id);
    }
}
