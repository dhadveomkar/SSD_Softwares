using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface IProjectRepository
    {
        IEnumerable<Project> GetProjects();
        Project GetProjectById(int id);
        Project SaveProject(Project project);
        Project DeleteProject(int id);
    }
}