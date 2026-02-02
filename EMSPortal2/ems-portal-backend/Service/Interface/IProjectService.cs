using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface IProjectService
    {
        IEnumerable<Project> GetProjects();
        Project GetProjectById(int id);
        Project SaveProject(Project project);
        Project DeleteProject(int id);
    }
}