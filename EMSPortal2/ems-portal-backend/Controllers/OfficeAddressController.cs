using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OfficeAddressController : Controller
    {
        private readonly IOfficeAddressService _OfficeAddressService;

        public OfficeAddressController(IOfficeAddressService OfficeAddressService)
        {
            _OfficeAddressService = OfficeAddressService;
        }

        [HttpGet("GetAllOfficeAddresses")]
        public IActionResult GetLeaveRequests()
        {
            return Ok(_OfficeAddressService.GetOfficeAddresses());
        }

        [HttpGet("GetOfficeAddress/{id}")]
        public IActionResult GetOfficeAddress(int id)
        {
            return Ok(_OfficeAddressService.GetOfficeAddressById(id));
        }
    }
}
