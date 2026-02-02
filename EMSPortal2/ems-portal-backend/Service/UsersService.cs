using Microsoft.AspNetCore.Mvc;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;
using static POCEmployeePortal.Repository.UsersRepository;

namespace POCEmployeePortal.Service
{
    public class UsersService : IUsersService

    {
        private readonly IUsersRepository _userRepo;
        private readonly JwtService _jwtService;
        private readonly IConfiguration configuration;
        private readonly UsersRepository usersRepository;
        public UsersService(IUsersRepository userRepo, JwtService jwtService)
        {
            _userRepo = userRepo;
            _jwtService = jwtService;
        }

        public IEnumerable<Users> GetUsers()
        {
            return _userRepo.GetUsers();
        }

        public Users GetUserById(string id)
        {
            return _userRepo.GetUserById(id);
        }

        public Users SaveUser(Users user)
        {
            return _userRepo.SaveUser(user);
        }

        public Users DeleteUser(string id)
        {
            return _userRepo.DeleteUser(id);
        }

        //public IActionResult Login(Users user)
        //{
        //    var result = _userRepo.Login(user.Email, user.Password);

        //    if (result == null)
        //    {
        //        return new UnauthorizedObjectResult("Wrong Credentials");
        //    }

        //    return new OkObjectResult(result);
        //}

        public IActionResult Login(Users user)
        {
            var authenticatedUser = _userRepo.Login(user.Email, user.Password);

            if (authenticatedUser == null)
            {
                return new UnauthorizedObjectResult("Invalid credentials");
            }

            var token = _jwtService.GenerateToken(authenticatedUser);

            return new OkObjectResult(new
            {
                Token = token,
                User = new
                {
                    //Id = authenticatedUser.EmpId,
                    //Email = authenticatedUser.Email,
                    //Name = authenticatedUser.UserName,
                    //Role = authenticatedUser.Role
                }
            });
        }

        //public IActionResult ForgotPassword(Users user)
        //{
        //    var authenticatedUser = _userRepo.ForgotPassword(user.Email);

        //    if (authenticatedUser == null)
        //    {
        //        return new UnauthorizedObjectResult("Invalid credentials");
        //    }

        //    var token = _jwtService.GenerateToken(authenticatedUser);

        //    return new OkObjectResult(new
        //    {
        //        Token = token,
        //        User = new
        //        {
        //            //Id = authenticatedUser.EmpId,
        //            //Email = authenticatedUser.Email,
        //            //Name = authenticatedUser.UserName,
        //            //Role = authenticatedUser.Role
        //        }
        //    });
        //}


        public async Task UploadFileToSharePoint(string fileName, string filePath)
        {
            try
            {

                string folderRelativeUrl = configuration.GetSection("SharePointConfig:SharePointFolder").Value;              

                await usersRepository.UploadFileToSharePointAsync(folderRelativeUrl, fileName, filePath);

            }

            catch (Exception ex)

            {

                //throw new AppException(AppException.Cause.backend, $"Error uploading file to SharePoint: {ex.Message}");
                throw new Exception($"Error uploading file to SharePoint: {ex.Message}");
            }

        }

        public IEnumerable<Users> GetUsersByCompany(int companyId)
        {
            return _userRepo.GetUsersByCompany(companyId);
        }


        public async Task SendOtpEmailAsync(string email, string otp, string firstName)
        {
            await _userRepo.SendOtpEmailAsync(email, otp, firstName);
        }

        public async Task<bool> VerifyOldPasswordAsync(string email, string oldPassword)
        {
            return await _userRepo.VerifyOldPasswordAsync(email, oldPassword);
        }


       



        //public async Task UploadFileToSharePoint(string fileName, string filePath)

        //{

        //    try

        //    {

        //        string folderPath = configuration.GetSection("SharePointConfig:SharePointFolder").Value; ;

        //        await toolDetailsRepository.UploadFileToSharePointAsync(folderPath, fileName, filePath);

        //    }

        //    catch (Exception ex)

        //    {

        //        throw new AppException(AppException.Cause.backend, $"Error uploading file to SharePoint: {ex.Message}");

        //    }

        //}
    }

}
