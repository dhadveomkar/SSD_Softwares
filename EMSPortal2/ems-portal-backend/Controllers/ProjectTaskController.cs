using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectTaskController : Controller
    {
        private readonly IProjectTaskService _ProjectTaskService;

        public ProjectTaskController(IProjectTaskService ProjectTaskService)
        {
            _ProjectTaskService = ProjectTaskService;
        }

        [HttpGet("GetAllProjectTasks")]
        public IActionResult GetProjectTasks()
        {
            return Ok(_ProjectTaskService.GetProjectTasks());
        }

        [HttpGet("GetProjectTask/{id}")]
        public IActionResult GetProjectTask(int id)
        {
            return Ok(_ProjectTaskService.GetProjectTaskById(id));
        }

        [HttpPost("Save")]
        public IActionResult SaveProjectTask([FromBody] ProjectTask ProjectTask)
        {
            return Ok(_ProjectTaskService.SaveProjectTask(ProjectTask));
        }

        [HttpGet("Delete/{id}")]
        public IActionResult DeleteProjectTask(int id)
        {
            return Ok(_ProjectTaskService.DeleteProjectTask(id));
        }
    }
}