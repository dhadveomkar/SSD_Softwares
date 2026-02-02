using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class ProjectRepository : IProjectRepository
    {
        private readonly POCEmployeePortalContext _db;

        public ProjectRepository(POCEmployeePortalContext db)
        {
            _db = db;
        }

        public IEnumerable<Project> GetProjects()
            => _db.Projects.ToList();

        public Project GetProjectById(int id)
            => _db.Projects.FirstOrDefault(p => p.ProjectId == id);

        public Project SaveProject(Project project)
        {
            if (project == null) return null;

            if (project.ProjectId > 0)
            {
                // Update existing
                var existing = _db.Projects.Find(project.ProjectId);
                if (existing != null)
                {
                    existing.Name = project.Name;
                    existing.Description = project.Description;
                    existing.StartDate = project.StartDate;
                    existing.EndDate = project.EndDate;
                }
            }
            else
            {
                // Insert new
                _db.Projects.Add(project);
            }

            _db.SaveChanges();
            return project;
        }

        public Project DeleteProject(int id)
        {
            var project = _db.Projects.Find(id);
            if (project != null)
            {
                _db.Projects.Remove(project);
                _db.SaveChanges();
            }
            return project;
        }
    }
}