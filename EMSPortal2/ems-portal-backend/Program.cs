using ClosedXML.Parser;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using OfficeOpenXml;
using POCEmployeePortal.Models;
//using POCEmployeePortal.ApplicationDB;
using POCEmployeePortal.Repository;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service;
using POCEmployeePortal.Service.Interface;
using POCEmployeePortal.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// JWT Configuration
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["AppSettings:Token"])
        ),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],

        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"],

        ValidateLifetime = true, // ? Enforce expiration
        ClockSkew = TimeSpan.Zero // ? Remove 5-minute grace period
    };

    // Customize response for expired token
    options.Events = new JwtBearerEvents
    {
        OnAuthenticationFailed = context =>
        {
            context.Response.StatusCode = 401;
            context.Response.ContentType = "application/json";

            string message = context.Exception switch
            {
                SecurityTokenExpiredException => "Token is expired, please reset token",
                SecurityTokenInvalidSignatureException => "Invalid token signature",
                SecurityTokenInvalidLifetimeException => "Token lifetime is invalid",//NA
                SecurityTokenNoExpirationException => "Token has no expiration",//NA
                _ => "Invalid or malformed token"
            };

            return context.Response.WriteAsync($"{{\"message\":\"{message}\"}}");
        },

        OnChallenge = context =>
        {
            if (!context.Response.HasStarted)
            {
                context.HandleResponse();
                context.Response.StatusCode = 401;
                context.Response.ContentType = "application/json";

                var result = System.Text.Json.JsonSerializer.Serialize(new
                {
                    message = "Token is required"
                });

                return context.Response.WriteAsync(result);
            }

            return Task.CompletedTask;
        }
    };
});

builder.Services.AddControllers(options =>
{
    var policy = new AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser()
        .Build();
    options.Filters.Add(new AuthorizeFilter(policy));
});

builder.Configuration.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true);

// Register GraphEmailService first
builder.Services.AddScoped<POCEmployeePortal.Service.GraphEmailService>();

// Add this line:
builder.Services.AddSingleton<JwtService>();

ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

// Repository registration (you'll need to implement TimesheetRepository)
builder.Services.AddScoped<ITimeSheetRepository, TimeSheetRepository>();

// Then register EmailService (depends on GraphEmailService)
builder.Services.AddScoped<POCEmployeePortal.Service.EmailService>();


// Service registration
builder.Services.AddScoped<ITimeSheetService, TimeSheetService>();

// Register EF Core with SQL Server
//builder.Services.AddDbContext<POCEmployeePortalContext>(options =>
//    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddDbContext<POCEmployeePortalContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

//birtthday wish send
builder.Services.AddHostedService<BirthdayJobService>();



builder.Services.AddScoped<IDailyTaskRepository, DailyTaskRepository>();
builder.Services.AddScoped<IDailyTaskService, DailyTaskService>();

// Add these lines in Program.cs (or ConfigureServices in Startup.cs)
builder.Services.AddScoped<IAttendanceRegularizationRepository, AttendanceRegularizationRepository>();
builder.Services.AddScoped<IAttendanceRegularizationService, AttendanceRegularizationService>();

builder.Services.AddScoped<IAttendanceRepository, AttendanceRepository>();
builder.Services.AddScoped<IAttendanceService, AttendanceService>();


builder.Services.AddScoped<IHolidayRepository, HolidayRepository>();
builder.Services.AddScoped<IHolidayService, HolidayService>();

builder.Services.AddScoped<IOfficeAddressRepository, OfficeAddressRepository>();
builder.Services.AddScoped<IOfficeAddressService, OfficeAddressService>();

builder.Services.AddScoped<IUsersRepository, UsersRepository>();
builder.Services.AddScoped<IUsersService, UsersService>();


builder.Services.AddScoped<ILeaveRequestRepository, LeaveRequestRepository>();
builder.Services.AddScoped<ILeaveRequestService, LeaveRequestService>();

builder.Services.AddScoped<ILeaveBalanceRepository, LeaveBalanceRepository>();
builder.Services.AddScoped<ILeaveBalanceService, LeaveBalanceService>();

builder.Services.AddScoped<ILeaveTypeRepository, LeaveTypeRepository>();
builder.Services.AddScoped<ILeaveTypeService, LeaveTypeService>();

builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<IProjectService, ProjectService>();

builder.Services.AddScoped<IProjectTaskRepository, ProjectTaskRepository>();
builder.Services.AddScoped<IProjectTaskService, ProjectTaskService>();

builder.Services.AddScoped<ITimeEntryRepository, TimeEntryRepository>();
builder.Services.AddScoped<ITimeEntryService, TimeEntryService>();
builder.Logging.AddConsole();

// Register LeaveCountRepository and LeaveCountService for DI
builder.Services.AddScoped<ILeaveCountRepository, LeaveCountRepository>();
builder.Services.AddScoped<ILeaveCountService, LeaveCountService>();

// (Optional) Enable CORS for frontend or Postman
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin()
               .AllowAnyMethod()
               .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();
