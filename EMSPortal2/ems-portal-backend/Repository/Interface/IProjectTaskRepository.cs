using POCEmployeePortal.Models;


namespace POCEmployeePortal.Repository.Interface
{
    public interface IProjectTaskRepository
    {
        IEnumerable<Models.ProjectTask> GetProjectTasks();
        Models.ProjectTask GetProjectTaskById(int id);
        Models.ProjectTask SaveProjectTask(ProjectTask ProjectTask);
        Models.ProjectTask DeleteProjectTask(int id);
    }
}