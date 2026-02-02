
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using OfficeOpenXml;
using OfficeOpenXml.Packaging.Ionic.Zip;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using System.Net.Http.Headers;
using static System.Net.WebRequestMethods;

using ClosedXML.Excel;

using Microsoft.Graph;

using Newtonsoft.Json.Linq;

using DocumentFormat.OpenXml.InkML;

using Microsoft.SharePoint.Client;

using File = Microsoft.SharePoint.Client.File;

using Folder = Microsoft.SharePoint.Client.Folder;

using List = Microsoft.SharePoint.Client.List;

using Microsoft.SharePoint;

using Microsoft.CodeAnalysis;



using System.Xml.Linq;

using System.Net.Http;

using System.Net.Http.Headers;

using System.Xml;
using System;
using Microsoft.Net.Http.Headers;
using System.IO;

using System.Drawing.Drawing2D;
using Microsoft.AspNetCore.Routing.Template;
using System.Collections.Generic;


namespace POCEmployeePortal.Repository
{
    public class UsersRepository : IUsersRepository
    {
        private readonly POCEmployeePortalContext db;
        private readonly POCEmployeePortal.Service.EmailService _emailService;

        public UsersRepository(POCEmployeePortalContext context, POCEmployeePortal.Service.EmailService emailService) // Injected by DI
        {
            db = context;
            _emailService = emailService;
        }


        string ClientSecret = "";

        string ClientId = "";
        string SiteUrl = "";
        string GrantType = "";
        string Scope = "";
        string sharePointFolder = "";


        string TenantId = "";

        //public UsersRepository(POCEmployeePortalContext db, IConfiguration configuration)
        //{
        //    this.db = db;
        //    this.configuration = configuration;
        //    _excelStoragePath = configuration.GetConnectionString("ExcelStoragePath");
        //    Directory.CreateDirectory(_excelStoragePath); // Ensure folder exists



        //    ClientId = configuration.GetSection("SharePointConfig").GetSection("ClientId").Value;

        //    SiteUrl = configuration.GetSection("SharePointConfig").GetSection("SharePointURL").Value;

        //    Scope = configuration.GetSection("SharePointConfig").GetSection("Scope").Value;

        //    ClientSecret = configuration.GetSection("SharePointConfig").GetSection("ClientSecret").Value;

        //    sharePointFolder = configuration.GetSection("SharePointConfig").GetSection("SharePointFolder").Value;

        //    GrantType = configuration.GetSection("SharePointConfig").GetSection("grantType").Value;

        //    TenantId = configuration.GetSection("SharePointConfig").GetSection("TenantId").Value;


        //}


        public IEnumerable<Users> GetUsers()
        {
            var result = from user in db.Users
                         select user;
            return result;
        }

        public Users GetUserById(string id)
        {
            var result = (from user in db.Users
                          where user.EmpId == id
                          select user).FirstOrDefault();
            return result;
        }


        
        
           
        




        public Users SaveUser(Users user)
        {
            if (user == null) return null;

            try
            {
                if (string.IsNullOrEmpty(user.EmpId))
                    throw new ArgumentException("EmpId is required");

                var company = db.CompanyDetail
                    .FirstOrDefault(c => c.CompanyId == user.CompanyId);

                //if (company == null)
                  //  throw new Exception("Company name does not exist in CompanyDetail table.");

                // 🔹 Set CompanyId to User
                //user.CompanyId = company.CompanyId;

                var existingUser = db.Users.FirstOrDefault(x => x.EmpId == user.EmpId);
                Users resultUser;

                if (existingUser != null)
                {
                    existingUser.UserName = user.UserName;
                    existingUser.FirstName = user.FirstName;
                    existingUser.MiddleName = user.MiddleName;
                    existingUser.LastName = user.LastName;
                    existingUser.Email = user.Email;
                    //existingUser.Password = user.Password; 
                    existingUser.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                    existingUser.Gender = user.Gender;
                    existingUser.Address = user.Address;
                    existingUser.MobileNumber = user.MobileNumber;
                    existingUser.DateOfBirth = user.DateOfBirth;
                  //  existingUser.Department = user.Department;
                   // existingUser.CompanyName = user.CompanyName;
                    existingUser.Holiday = user.Holiday;
                    existingUser.Role = user.Role;
                    existingUser.JoiningDate = user.JoiningDate;
                    existingUser.ReportingManager = user.ReportingManager;
                    existingUser.Timesheet = user.Timesheet;
                    existingUser.DepartmentId = user.DepartmentId;
                    existingUser.DesignationId = user.DesignationId;
                    existingUser.RoleId = user.RoleId;
                    existingUser.CompanyId = user.CompanyId;

                    db.Users.Update(existingUser);
                    db.SaveChanges();
                    resultUser = existingUser;
                }
                else
                {
                    user.Password = BCrypt.Net.BCrypt.HashPassword(user.Password);
                    db.Users.Add(user);
                    db.SaveChanges();
                    resultUser = user;
                }

                // Trigger email after save
                try
                {
                    // Example: send welcome or update email
                    var subject = $"{resultUser.FirstName} {resultUser.LastName} Details Saved Successfully";
                    var portalLink = "http://60.254.115.242:8086/login-page"; // Replace with actual portal link
                    var body = $@"
<p>Dear {resultUser.FirstName} {resultUser.LastName},</p>

<p>We are pleased to inform you that you have been granted access to Employee Portal Management. 
This portal is designed to help you raise requests, submit leave applications, track tasks, and manage your work efficiently.</p>

<p>Please find your login credentials below:<br />
<strong>Employee ID (EID):</strong> {resultUser.EmpId}<br />
<strong>Email:</strong> {resultUser.Email}<br />
<strong>Password:</strong> {resultUser.Password}</p>

<p>You can access the Employee Portal Management here: 
<a href='http://60.254.115.242:8086/login-page'>Employee Portal</a></p>

<p>
  <strong>Note:</strong> This is a system-generated notification sent from an unmonitored email account. 
  Please <span style=""color:red;"">do not reply</span> to this message.
</p>

";

                    

                    _emailService.SendSimpleEmailAsync(resultUser.Email, subject, body).Wait();

                }
                catch (Exception emailEx)
                {
                    // Optionally log email sending failure
                }

                return resultUser;
            }
            catch (Exception ex)
            {
                // Error handling
                throw;
            }
        }

        public async Task UploadFileToSharePointAsync(string folderRelativeUrl, string fileName, string filePath)
        {
            //await EnsureFolderExistsAsync(folderRelativeUrl);

            var apiUrl = $"{SiteUrl}/_api/web/getfolderbyserverrelativeurl('{folderRelativeUrl}')/files/add(url='{fileName}',overwrite=true)";
            //var apiUrl = $"https://ssdsoftwares1-my.sharepoint.com/my?id=%2Fpersonal%2Fvaibhav%5Fkotkar%5Fssdsoftwares%5Fcom%2FDocuments%2FEmployee%5FDetails{fileName}";
            using var httpClient = await GetHttpClientAsync();
            using var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            using var fileContent = new StreamContent(fileStream);

            fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue("application/octet-stream");

            var response = await httpClient.PostAsync(apiUrl, fileContent);
            response.EnsureSuccessStatusCode();
        }


        public async Task<HttpClient> GetHttpClientAsync()
        {
            var tokenObj = await GetAccessTokenAsync();
            var accessToken = tokenObj?["access_token"]?.ToString();

            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            return httpClient;
        }


        public IEnumerable<Users> GetUsersByCompany(int companyId)
        {
            return db.Users.Where(x => x.CompanyId == companyId).ToList();
        }


        public async Task<JObject> GetAccessTokenAsync()
        {
            try
            {
                using var httpClient = new HttpClient();

                string url = $"https://login.microsoftonline.com/{this.TenantId}/oauth2/v2.0/token";

                var contentDict = new Dictionary<string, string>
        {
            { "client_id", this.ClientId },
            { "scope", this.Scope },
            { "client_secret", this.ClientSecret },
            { "grant_type", this.GrantType }
        };

                using var request = new HttpRequestMessage(HttpMethod.Post, url)
                {
                    Content = new FormUrlEncodedContent(contentDict)
                };

                var response = await httpClient.SendAsync(request);
                var data = await response.Content.ReadAsStringAsync();

                if (response.IsSuccessStatusCode)
                {
                    return JObject.Parse(data);
                }

                return null;
            }
            catch
            {
                return null;
            }
        }

        //public jobject GetAccessTokenAsync()

        //{

        //    try

        //    {

        //        using (var httpclient = new System.Net.Http.httpclient())

        //        {

        //            string url = https://accounts.accesscontrol.windows.net/96ece526-9c7d-48b0-8daf-8b93c90a5d18/tokens/oauth/2;

        //            using (var request = new system.net.http.httprequestmessage(new system.net.http.httpmethod("post"), url))

        //            {



        //                var contentlist = new list<string>();

        //                contentlist.add($"client_secret=" + "dfr8q~fcu8ar1w9mtttblsyydhena1owcoj~tc0u");

        //                contentlist.add($"grant_type=" + this.granttype);

        //                contentlist.add($"client_id=" + this.clientid);



        //                contentlist.add($"resource=" + this.resource);

        //                contentlist.add($"scope=" + this.scope);



        //                request.content = new system.net.http.stringcontent(string.join("&", contentlist));



        //                request.content.headers.contenttype = mediatypeheadervalue.parse("application/x-www-form-urlencoded");

        //                var response = httpclient.sendasync(request).result;

        //                var data = response.content.readasstringasync().result;

        //                var obj = jobject.parse(data);

        //                // var obj = jobject.parse(data);

        //                if (response.statuscode == system.net.httpstatuscode.ok)

        //                {

        //                    return obj;

        //                }

        //                else

        //                {

        //                    return null;

        //                }

        //            }

        //        }





        //    }

        //    catch (exception e)

        //    {



        //        return null;

        //    }

        //}
        public async Task<string> MapSheet(string EmpId)

        {

            try

            {

                // Check if EmpId record exists in the database

                var employeeDetail = await db.Users

                    .FirstOrDefaultAsync(x =>

                        (!string.IsNullOrWhiteSpace(EmpId) && x.EmpId == EmpId));



                //string fileName;

                string folderPath = sharePointFolder;



                // Determine filename based on input parameters

                //if (employeeDetail?.IsNonWA == true)
                //{
                //    fileName = $"{EmpId}.xlsx"; // Use EmpId for filename
                //}
                string fileName = $"{EmpId}.xlsx";



                // Get file URL from SharePoint

                using (var httpClient = await GetHttpClientAsync())

                {

                    var queryUrl = $"{SiteUrl}/_api/web/GetFolderByServerRelativeUrl('{folderPath}')/Files('{fileName}')";



                    var response = await httpClient.GetAsync(queryUrl);



                    if (response.IsSuccessStatusCode)

                    {

                        var jsonResponse = await response.Content.ReadAsStringAsync();



                        // Parse XML response

                        var doc = new System.Xml.XmlDocument();

                        doc.LoadXml(jsonResponse);



                        // Get LinkingUrl from properties

                        var nsManager = new System.Xml.XmlNamespaceManager(doc.NameTable);

                        nsManager.AddNamespace("d", "http://schemas.microsoft.com/ado/2007/08/dataservices");

                        nsManager.AddNamespace("m", "http://schemas.microsoft.com/ado/2007/08/dataservices/metadata");



                        var linkingUrlNode = doc.SelectSingleNode("//d:LinkingUrl", nsManager);



                        if (linkingUrlNode != null)

                        {

                            // Return the direct SharePoint file URL

                            return linkingUrlNode.InnerText;

                        }

                    }



                    // Fallback to default URL structure if file not found

                    //string documentId = employeeDetail?.IsNonWA == true

                    //     ? (!string.IsNullOrWhiteSpace(EmpId)

                    //         ? "49A1EB58-D05A-454A-96A9-6160E40D26A1"

                    //         : "600155FE-7E64-4B96-BBA8-3896E9980B13")

                    //     : "215FE3AC-AB59-4E76-917D-0251E5C01880";



                    return null;
                }
            }
            catch (Exception ex)
            {
                //throw new AppException(AppException.Cause.backend, $"Error generating SharePoint URL: {ex.Message}");
                throw new Exception($"Error generating SharePoint URL: {ex.Message}");
            }
        }


        private bool IsDuplicateKeyException(DbUpdateException ex)
        {
            return ex.InnerException is SqlException sqlEx &&
                   (sqlEx.Number == 2627 || sqlEx.Number == 2601); // SQL Server error codes for unique constraint violations
        }


        public Users DeleteUser(string id)
        {
            int result = 0;
            var u1 = db.Users.Where(x => x.EmpId == id).FirstOrDefault();
            if (u1 != null)
            {
                db.Users.Remove(u1); // removes the object from DbSet
                result = db.SaveChanges(); // reflect the changes in DB
            }
            if (result > 0)
            {
                return u1;
            }
            else
            {
                return null;
            }
        }

        public Users Login(string email, string password)
        {
            // All login logic stays in repository
            var user = db.Users.SingleOrDefault(x => x.Email == email || x.EmpId == email);

            if (user == null)
            {
                return null;
            }

            // Verify password (consider using password hashing)
            if (!BCrypt.Net.BCrypt.Verify(password, user.Password))
                return null;



            return user;
        }



        public async Task SendOtpEmailAsync(string email, string otp, string firstName)
        {
            var subject = "Your OTP for Password Reset";
            var body = $@"
<p>Hello {firstName},</p>
<p>Your OTP for resetting your password is:</p>
<h2>{otp}</h2>
<p>This OTP is valid for 5 minutes.</p>
<p>
<strong>Note:</strong> This is a system-generated notification sent from an unmonitored email account. 
  Please <span style=""color:red;"">do not reply</span> to this message.
</p>
 
        ";

            await _emailService.SendSimpleEmailAsync(email, subject, body);
        }

        public async Task<bool> VerifyOldPasswordAsync(string email, string oldPassword)
        {
            var user = await db.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            if (user == null)
                return false;

            return user.Password == oldPassword;
        }

        public async Task<Users> GetByEmailAsync(string email)
        {
            return await db.Users
                .FirstOrDefaultAsync(u => u.Email == email);
        }


        private void CreateUserTimesheet(Users user)
        {
            try
            {
                // Create a new timesheet record in the database
                var timesheet = new Timesheet
                {
                    EmpId = user.EmpId,
                    UserName = user.UserName,
                    CreatedDate = DateTime.Now,
                    FilePath = GenerateTimesheetExcel(user) // This will create the Excel file and return its path
                };

                db.Timesheets.Add(timesheet);
                db.SaveChanges();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating timesheet: {ex.Message}");
                // You might want to handle this differently - maybe log it but not fail the user creation
            }
        }

        private string GenerateTimesheetExcel(Users user)
        {
            // You'll need to implement Excel file generation
            // Here's a basic example using EPPlus (you'll need to install the EPPlus NuGet package)

            var fileName = $"Timesheet_{user.EmpId}_{DateTime.Now:yyyyMMdd}.xlsx";
            var directoryPath = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "Timesheets");

            if (!System.IO.Directory.Exists(directoryPath))
            {
                System.IO.Directory.CreateDirectory(directoryPath);
            }


            var filePath = Path.Combine(directoryPath, fileName);

            using (var package = new OfficeOpenXml.ExcelPackage())
            {
                var worksheet = package.Workbook.Worksheets.Add("Timesheet");

                // Add headers
                worksheet.Cells[1, 1].Value = "Employee ID";
                worksheet.Cells[1, 2].Value = "Employee Name";
                worksheet.Cells[1, 3].Value = "Date";
                worksheet.Cells[1, 4].Value = "Hours Worked";
                worksheet.Cells[1, 5].Value = "Project";
                worksheet.Cells[1, 6].Value = "Task";
                worksheet.Cells[1, 7].Value = "Description";

                // Add user info
                worksheet.Cells[2, 1].Value = user.EmpId;
                worksheet.Cells[2, 2].Value = $"{user.FirstName} {user.LastName}";

                // Formatting
                worksheet.Cells[1, 1, 1, 7].Style.Font.Bold = true;

                package.SaveAs(new FileInfo(filePath));
            }

            return filePath;
        }


    }
}
