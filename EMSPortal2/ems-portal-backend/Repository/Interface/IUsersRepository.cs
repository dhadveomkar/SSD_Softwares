using POCEmployeePortal.Models;


namespace POCEmployeePortal.Repository.Interface
{
    public interface IUsersRepository
    {
        IEnumerable<Users> GetUsers();

        Users GetUserById(string UserId);

        IEnumerable<Users> GetUsersByCompany(int companyId);


        Users SaveUser(Users user);

        Users DeleteUser(string UserId);

        Users Login(string email, string password);
        //  Users ForgotPassword(string email);

        Task SendOtpEmailAsync(string email, string otp, string firstName);
        Task<bool> VerifyOldPasswordAsync(string email, string oldPassword);

        Task<Users> GetByEmailAsync(string email);
    }
}
