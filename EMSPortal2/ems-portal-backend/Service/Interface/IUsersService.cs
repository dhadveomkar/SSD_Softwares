using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface IUsersService

    {
        IEnumerable<Users> GetUsers();

        Users GetUserById(string UserId);

        IEnumerable<Users> GetUsersByCompany(int companyId);


        Users SaveUser(Users user);
       

        Users DeleteUser(string UserId);

        IActionResult Login(Users user);
        //IActionResult ForgotPassword(Users user);
        Task SendOtpEmailAsync(string email, string otp, string firstName);
        Task<bool> VerifyOldPasswordAsync(string email, string oldPassword);

    }
}
