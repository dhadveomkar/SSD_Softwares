using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using POCEmployeePortal.Models;
using POCEmployeePortal.Service;

public class BirthdayJobService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;

    // ✅ Constructor (not a method)
    public BirthdayJobService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    // ✅ Must override ExecuteAsync
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var now = DateTime.Now;
            var nextRun = DateTime.Today.AddHours(9);

            if (now > nextRun)
            {
                nextRun = nextRun.AddDays(1);
            }

            var delay = nextRun - now;
            await Task.Delay(delay, stoppingToken);

            await CheckAndSendBirthdayEmails();

            await Task.Delay(TimeSpan.FromDays(1), stoppingToken);
        }
    }

    private async Task CheckAndSendBirthdayEmails()
    {
        using (var scope = _serviceProvider.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<POCEmployeePortalContext>();
            var emailService = scope.ServiceProvider.GetRequiredService<EmailService>();

            var today = DateTime.Today;

            var birthdayUsers = await db.Users
                .Where(u => u.DateOfBirth.HasValue &&
                            u.DateOfBirth.Value.Day == today.Day &&
                            u.DateOfBirth.Value.Month == today.Month)
                .ToListAsync();

            foreach (var user in birthdayUsers)
            {
                try
                {
                    string subject = $"Happy Birthday {user.FirstName}! 🎉";
                    string body = $@"
                        <p>Dear {user.FirstName},</p>
                        <p>Wishing you a very Happy Birthday 🎂🎁🎉!</p>
                        <p>May your day be filled with happiness and success.</p>
                        <br/>
                        <p>- Employee Portal Team</p>";

                    await emailService.SendSimpleEmailAsync(user.Email, subject, body);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Error sending birthday email: {ex.Message}");
                }
            }
        }
    }
}
