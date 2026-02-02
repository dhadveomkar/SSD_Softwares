using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectController : Controller
    {
        private readonly IProjectService _projectService;

        public ProjectController(IProjectService projectService)
        {
            _projectService = projectService;
        }

        [HttpGet("GetAllProjects")]
        public IActionResult GetProjects()
        {
            return Ok(_projectService.GetProjects());
        }

        [HttpGet("GetProject/{id}")]
        public IActionResult GetProject(int id)
        {
            return Ok(_projectService.GetProjectById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveProject([FromBody] Project project)
        {
            return Ok(_projectService.SaveProject(project));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteProject(int id)
        {
            return Ok(_projectService.DeleteProject(id));
        }
    }
}