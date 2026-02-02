using POCEmployeePortal.Models;

namespace POCEmployeePortal.ApiResponce
{
    public class LoginResponseDto
    {
        public string Token { get; set; }
        public Users User { get; set; }
    }
}
