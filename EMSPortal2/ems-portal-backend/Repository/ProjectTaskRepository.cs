using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class ProjectTaskRepository : IProjectTaskRepository
    {
        private readonly POCEmployeePortalContext _db;

        public ProjectTaskRepository(POCEmployeePortalContext db)
        {
            _db = db;
        }

        public IEnumerable<Models.ProjectTask> GetProjectTasks()
        {
            return _db.ProjectTasks.ToList();
        }

        public Models.ProjectTask GetProjectTaskById(int id)
        {
            return _db.ProjectTasks.FirstOrDefault(t => t.ProjectTaskId == id);
        }

        public Models.ProjectTask SaveProjectTask(Models.ProjectTask ProjectTask)
        {
            if (ProjectTask == null)
                return null;

            if (ProjectTask.ProjectTaskId > 0)
            {
                // Update existing ProjectTask
                var existingProjectTask = _db.ProjectTasks.Find(ProjectTask.ProjectTaskId);
                if (existingProjectTask != null)
                {                         
                    existingProjectTask.ProjectId = ProjectTask.ProjectId;
                    existingProjectTask.Name = ProjectTask.Name;
                    existingProjectTask.Description = ProjectTask.Description;

                    _db.SaveChanges();
                    return ProjectTask;
                }
            }

            // Add new ProjectTask
            _db.ProjectTasks.Add(ProjectTask);
            _db.SaveChanges();

            return ProjectTask;
        }

        public Models.ProjectTask DeleteProjectTask(int id)
        {
            var ProjectTask = _db.ProjectTasks.Find(id);
            if (ProjectTask != null)
            {
                _db.ProjectTasks.Remove(ProjectTask);
                _db.SaveChanges();
                return ProjectTask;
            }
            return null;
        }
    }
}