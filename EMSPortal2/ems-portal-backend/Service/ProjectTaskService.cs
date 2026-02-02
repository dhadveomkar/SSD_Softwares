using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;
using System.Collections.Generic;

namespace POCEmployeePortal.Services
{
    public class ProjectTaskService : IProjectTaskService
    {
        private readonly IProjectTaskRepository _ProjectTaskRepository;

        public ProjectTaskService(IProjectTaskRepository ProjectTaskRepository)
        {
            _ProjectTaskRepository = ProjectTaskRepository;
        }

        public IEnumerable<Models.ProjectTask> GetProjectTasks()
        {
            return _ProjectTaskRepository.GetProjectTasks();
        }

        public Models.ProjectTask GetProjectTaskById(int id)
        {
            return _ProjectTaskRepository.GetProjectTaskById(id);
        }

       public POCEmployeePortal.Models.ProjectTask SaveProjectTask(POCEmployeePortal.Models.ProjectTask ProjectTask)
        {
            return _ProjectTaskRepository.SaveProjectTask(ProjectTask);
        }

        public Models.ProjectTask DeleteProjectTask(int id)
        {
            return _ProjectTaskRepository.DeleteProjectTask(id);
        }
    }
}