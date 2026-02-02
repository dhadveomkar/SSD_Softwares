using Microsoft.EntityFrameworkCore.Metadata.Internal;
using POCEmployeePortal.Models;
using System.Collections.Generic;

namespace POCEmployeePortal.Service.Interface
{
    public interface IProjectTaskService
    {
        IEnumerable<Models.ProjectTask> GetProjectTasks();
        Models.ProjectTask GetProjectTaskById(int id);
        Models.ProjectTask SaveProjectTask(Models.ProjectTask ProjectTask);
        Models.ProjectTask DeleteProjectTask(int id);
    }
}