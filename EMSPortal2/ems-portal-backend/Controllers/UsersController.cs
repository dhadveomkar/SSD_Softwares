using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using POCEmployeePortal.ApiResponce;
using POCEmployeePortal.ApiResponse;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace POCEmployeePortal.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]

    public class UsersController : Controller
    {
        private readonly IUsersService _usersService;
        private readonly POCEmployeePortalContext _db;
        private readonly IConfiguration configuration;
        private readonly UsersService usersService;


        public UsersController(IUsersService usersService, POCEmployeePortalContext db, IConfiguration configuration)
        {
            _usersService = usersService;
            _db = db;
            this.configuration = configuration;
        }

        // [AllowAnonymous]
        //[HttpPost("ForgotPassword")]
        //public IActionResult ForgotPassword([FromBody] string email)
        //{
        //    var user = _db.Users.SingleOrDefault(x => x.Email == email || x.UserName == email);
        //    if (user == null)
        //    {
        //        return NotFound(new { message = "User with this email or username does not exist." });
        //    }
        //    // Return all user details to the frontend
        //    return Ok(new
        //    {
        //        user.EmpId,
        //        user.ManagerId,
        //        user.IsManagerAssigned,
        //        user.UserName,
        //        user.FirstName,
        //        user.MiddleName,
        //        user.LastName,
        //        user.Email,
        //        user.Password,
        //        user.Gender,
        //        user.Address,
        //        user.MobileNumber,
        //        user.DateOfBirth,
        //        user.Department,
        //        user.Designation,
        //        user.Role,
        //        user.JoiningDate,
        //        user.ReportingManager
        //    });
        //}


        [HttpGet("GetAllUsers")]
        public IActionResult GetUsers()
        {
            return Ok(_usersService.GetUsers());
        }

        [HttpGet("GetUser/{id}")]
        public IActionResult GetUser(string id)
        {
            return Ok(_usersService.GetUserById(id));
        }

        [HttpGet("GetUsersByCompany/{companyId}")]
        public IActionResult GetUsersByCompany(int companyId)
        {
            var users = _db.Users.Where(x => x.CompanyId == companyId).ToList();
            return Ok(users);
        }



        [HttpPost("Save")]
        public IActionResult SaveUser([FromBody] Users user)
        {
            return Ok(_usersService.SaveUser(user));
        }


        [HttpGet("Delete/{id}")]
        public IActionResult DeleteUser(string id)
        {
            return Ok(_usersService.DeleteUser(id));
        }

        [AllowAnonymous]
        [HttpPost("Login")]
        public IActionResult Login([FromBody] Users user)
        {
            var result = _db.Users
                .SingleOrDefault(x => x.EmpId == user.Email || x.Email == user.Email);

            if (result == null)
                return Unauthorized("User not found");

            // 🔐 Verify hashed password
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(user.Password, result.Password);

            if (!isPasswordValid)
                return Unauthorized("Wrong password");

            var jwtService = new JwtService(configuration);
            string token = jwtService.GenerateToken(result);

            return Ok(new
            {
                token,
                user = new
                {
                    result.EmpId,
                    result.UserName,
                    result.Email,
                    result.Role,
                    result.FirstName,
                    result.LastName,
                    result.Holiday,
                    result.Timesheet,
                    result.JoiningDate,
                    result.CompanyId,
                    result.DepartmentId,
                    result.DesignationId,
                    result.RoleId
                }
            });
        }



        [AllowAnonymous]
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email or Username is required.");

            var result = _db.Users.SingleOrDefault(x => x.UserName == request.Email || x.Email == request.Email);
            if (result == null)
                return Unauthorized("User not found.");

            // 1. Generate OTP (6 digits)
            var otp = new Random().Next(100000, 999999).ToString();

            // 2. Save OTP & Expiry in DB
            result.ResetOtp = otp;
            result.ResetOtpExpiry = DateTime.UtcNow.AddMinutes(5);
            result.IsOtpVerified = false;
            _db.SaveChanges();

            // 3. Send OTP via Email
            await _usersService.SendOtpEmailAsync(result.Email, otp, result.FirstName);

            // 4. Optional: Issue JWT token
            var jwtService = new JwtService(configuration);
            string token = jwtService.GenerateToken(result);

            return Ok(new
            {
                message = "OTP sent to registered email",
                token,
                user = new
                {
                    result.EmpId,
                    result.UserName,
                    result.Email,
                    result.FirstName,
                    result.LastName,
                    result.Holiday
                }
            });
        }


        [HttpGet("GetCompany/{companyId}")]
        public IActionResult GetCompany(int companyId)
        {
            var company = _db.CompanyDetail.FirstOrDefault(c => c.CompanyId == companyId);

            if (company == null)
                return NotFound("Company not found.");

            return Ok(new
            {
                company.CompanyId,
                company.CompanyName,
            });
        }

        [HttpGet("GetDepartment/{departmentId}")]
        public IActionResult GetDepartment(int departmentId)
        {
            var dept = _db.DepartmentNames.FirstOrDefault(d => d.DepartmentId == departmentId);

            if (dept == null)
                return NotFound("Department not found.");

            return Ok(new
            {
                dept.DepartmentId,
                dept.DepartmentName
            });
        }

        [HttpGet("GetAllDepartments")]
        public IActionResult GetAllDepartments()
        {
            var departments = _db.DepartmentNames
                .Select(d => new
                {
                    d.DepartmentId,
                    d.DepartmentName
                })
                .ToList();

            if (departments == null || !departments.Any())
                return NotFound("No departments found.");

            return Ok(departments);
        }

        [HttpGet("GetAllDesignations")]
        public IActionResult GetAllDesignations()
        {
            var designations = _db.Designations
                .Select(d => new
                {
                    d.DesignationId,
                    d.DesignationName
                })
                .ToList();

            if (designations == null || !designations.Any())
                return NotFound("No departments found.");

            return Ok(designations);
        }



        [HttpGet("GetDesignation/{designationId}")]
        public IActionResult GetDesignation(int designationId)
        {
            var designation = _db.Designations.FirstOrDefault(d => d.DesignationId == designationId);

            if (designation == null)
                return NotFound("Designation not found.");

            return Ok(new
            {
                designation.DesignationId,
                designation.DesignationName
            });
        }


        [HttpGet("GetAllRoles")]
        public IActionResult GetAllRoles()
        {
            var roles = _db.UserRoles
                .Select(d => new
                {
                    d.RoleId,
                    d.RoleName
                })
                .ToList();

            if (roles == null || !roles.Any())
                return NotFound("No departments found.");

            return Ok(roles);
        }

        [HttpGet("GetRole/{roleId}")]
        public IActionResult GetRole(int roleId)
        {
            var role = _db.UserRoles.FirstOrDefault(r => r.RoleId == roleId);

            if (role == null)
                return NotFound("Role not found.");

            return Ok(new
            {
                role.RoleId,
                role.RoleName
            });
        }




        [AllowAnonymous]
        [HttpPost("VerifyOtp")]
        public IActionResult VerifyOtp([FromBody] VerifyOtpDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.Otp))
                return BadRequest("Email and OTP are required.");

            var user = _db.Users.SingleOrDefault(x => x.Email == model.Email || x.UserName == model.Email);
            if (user == null)
                return Unauthorized("User not found.");

            if (user.ResetOtp == null || user.ResetOtpExpiry == null)
                return BadRequest("No OTP request found for this user.");

            if (user.ResetOtp != model.Otp || user.ResetOtpExpiry < DateTime.UtcNow)
                return BadRequest("Invalid or expired OTP.");

            user.IsOtpVerified = true;
            _db.SaveChanges();

            return Ok(new
            {
                message = "OTP verified successfully",
                user = new
                {
                    user.EmpId,
                    user.UserName,
                    user.Email,
                    user.FirstName,
                    user.LastName
                }
            });
        }

        [AllowAnonymous]
        [HttpPost("ResetPassword")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Email) ||
                string.IsNullOrWhiteSpace(model.NewPassword) ||
                string.IsNullOrWhiteSpace(model.ConfirmPassword))
                return BadRequest("Email, new password and confirm password are required.");

            var user = _db.Users
                .SingleOrDefault(x => x.Email == model.Email || x.UserName == model.Email);

            if (user == null)
                return Unauthorized("User not found.");

            if (user.IsOtpVerified != true)
                return BadRequest("OTP verification required.");

            if (model.NewPassword != model.ConfirmPassword)
                return BadRequest("New password and confirm password do not match.");

            // ✅ HASH PASSWORD
            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

            // Clear OTP fields
            user.ResetOtp = null;
            user.ResetOtpExpiry = null;
            user.IsOtpVerified = false;

            _db.SaveChanges();

            return Ok(new { message = "Password reset successful" });
        }



        [HttpPost("VerifyOldPassword")]
        public async Task<IActionResult> VerifyOldPassword([FromBody] VerifyOldPasswordDto model)
        {
            if (string.IsNullOrWhiteSpace(model.Email) || string.IsNullOrWhiteSpace(model.OldPassword))
                return BadRequest("Email and old password are required.");

            var isValid = await _usersService.VerifyOldPasswordAsync(model.Email, model.OldPassword);

            if (!isValid)
                return BadRequest("Old password is incorrect.");

            return Ok(new { message = "Old password verified successfully" });
        }

        [HttpPost("ChangePassword")]
        public IActionResult ChangePassword([FromBody] ChangePasswordDto model)
        {
            var user = _db.Users.SingleOrDefault(x => x.Email == model.Email);
            if (user == null)
                return Unauthorized("User not found.");

            // ✅ Verify hashed password
            if (!BCrypt.Net.BCrypt.Verify(model.OldPassword, user.Password))
                return BadRequest("Old password incorrect.");

            if (model.NewPassword != model.ConfirmPassword)
                return BadRequest("Passwords do not match.");

            // ✅ Hash new password
            user.Password = BCrypt.Net.BCrypt.HashPassword(model.NewPassword);

            _db.SaveChanges();

            return Ok(new { message = "Password changed successfully" });
        }



        [HttpPost("api/uploadFile/{EmpId}")]

        public async Task<IActionResult> UploadFile(string EmpId)

        {

            try

            {

                // Generate file name based on parameters

                string fileName = $"{EmpId}.xlsx";



                // Define template and temp paths

                string templatePath = Path.Combine("assets", "template.xlsx");

                if (!System.IO.File.Exists(templatePath))

                {

                    return NotFound("Template file not found");

                }



                string tempPath = Path.Combine(Path.GetTempPath(), fileName);



                try

                {

                    // Copy template to temp location

                    System.IO.File.Copy(templatePath, tempPath, true);



                    // Upload to SharePoint

                    string folderRelativeUrl = configuration.GetSection("SharePointConfig:SharePointFolder").Value;
                  

                    await usersService.UploadFileToSharePoint(fileName, tempPath);



                    // Clean up temp file

                    if (System.IO.File.Exists(tempPath))

                    {

                        System.IO.File.Delete(tempPath);

                    }



                    return Ok(new { message = "File uploaded successfully" });

                }

                catch

                {

                    // Clean up temp file in case of error

                    if (System.IO.File.Exists(tempPath))

                    {

                        System.IO.File.Delete(tempPath);

                    }

                    throw;

                }

            }

            catch (FileNotFoundException ex)

            {

                return NotFound($"Error locating template: {ex.Message}");

            }

            catch (Exception ex)

            {

                return StatusCode(500, $"Internal server error: {ex.Message}");

            }

        }





    }
}
