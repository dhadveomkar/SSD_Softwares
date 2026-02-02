using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class ProjectService : IProjectService
    {
        private readonly IProjectRepository _repository;

        public ProjectService(IProjectRepository repository)
        {
            _repository = repository;
        }

        public IEnumerable<Project> GetProjects()
            => _repository.GetProjects();

        public Project GetProjectById(int id)
            => _repository.GetProjectById(id);

        public Project SaveProject(Project project)
            => _repository.SaveProject(project);

        public Project DeleteProject(int id)
            => _repository.DeleteProject(id);
    }
}