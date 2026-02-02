using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service;

namespace POCEmployeePortal.Repository
{
    public class LeaveRequestRepository : ILeaveRequestRepository
    {
        private readonly POCEmployeePortalContext _db;
        private readonly IConfiguration _configuration;
        private readonly POCEmployeePortal.Service.EmailService _emailService;

        public LeaveRequestRepository(POCEmployeePortalContext db, IConfiguration configuration, POCEmployeePortal.Service.EmailService emailService)
        {
            _db = db;
            _configuration = configuration;
            _emailService = emailService;
        }

        public IEnumerable<LeaveRequest> GetLeaveRequests()
            => _db.LeaveRequest.ToList();

        public LeaveRequest GetLeaveRequestById(int id)
            => _db.LeaveRequest.FirstOrDefault(l => l.ApplicationId == id);

        //public LeaveRequest SaveLeaveRequest(LeaveRequest LeaveRequest)
        //{
        //    if (LeaveRequest == null) return null;

        //    if (LeaveRequest.ApplicationId > 0)
        //    {
        //        // Update existing record
        //        var existing = _db.LeaveRequest.Find(LeaveRequest.ApplicationId);
        //        if (existing != null)
        //        {
        //            existing.EmpId = LeaveRequest.EmpId;
        //            existing.Name = LeaveRequest.Name;
        //            existing.LeaveType = LeaveRequest.LeaveType;
        //            existing.StartDate = LeaveRequest.StartDate;
        //            existing.EndDate = LeaveRequest.EndDate;
        //            existing.Description = LeaveRequest.Description;
        //            existing.ManagerRemark = LeaveRequest.ManagerRemark;
        //            existing.Status = LeaveRequest.Status;


        //        }
        //    }
        //    else
        //    {
        //        // Insert new record
        //        _db.LeaveRequest.Add(LeaveRequest);
        //    }

        //    _db.SaveChanges();
        //    return LeaveRequest;
        //}

        //public LeaveRequest SaveLeaveRequest(LeaveRequest leaveRequest)
        //{
        //    // Validate input
        //    if (leaveRequest == null)
        //        throw new ArgumentNullException(nameof(leaveRequest));

        //    // Validate EmpId (now checking for empty/whitespace string)
        //    if (string.IsNullOrWhiteSpace(leaveRequest.EmpId))
        //        throw new ArgumentException("Employee ID (EmpId) is required and cannot be empty");

        //    if (leaveRequest.ApplicationId > 0)
        //    {
        //        // UPDATE existing record
        //        var existing = _db.LeaveRequest.Find(leaveRequest.ApplicationId);
        //        if (existing == null)
        //            throw new KeyNotFoundException($"Leave request with ID {leaveRequest.ApplicationId} not found");

        //        // Update all fields
        //        existing.EmpId = leaveRequest.EmpId;
        //        existing.Name = leaveRequest.Name ?? existing.Name; // Fallback to existing if null
        //        existing.LeaveType = leaveRequest.LeaveType;
        //        existing.StartDate = leaveRequest.StartDate;
        //        existing.EndDate = leaveRequest.EndDate;
        //        existing.Description = leaveRequest.Description;
        //        existing.ManagerRemark = leaveRequest.ManagerRemark;
        //        existing.Status = leaveRequest.Status;
        //        existing.LeaveDuration = leaveRequest.LeaveDuration;
        //    }
        //    else
        //    {
        //        // INSERT new record
        //        // Additional validation for new records
        //        if (string.IsNullOrWhiteSpace(leaveRequest.Name))
        //            throw new ArgumentException("Name is required for new leave requests");

        //        _db.LeaveRequest.Add(leaveRequest);
        //    }

        //    try
        //    {
        //        _db.SaveChanges();
        //        // After save, trigger email to manager
        //        SendLeaveRequestEmail(leaveRequest);
        //        return leaveRequest;


        //    }
        //    catch (DbUpdateException ex)
        //    {
        //        // Check for specific SQL errors
        //        if (ex.InnerException is SqlException sqlEx)
        //        {
        //            switch (sqlEx.Number)
        //            {
        //                case 515: // NULL insert error
        //                    throw new InvalidOperationException(
        //                        "Failed to save leave request: Required fields are missing", ex);
        //                case 547: // Foreign key violation
        //                    throw new InvalidOperationException(
        //                        "Failed to save leave request: Invalid employee reference", ex);
        //            }
        //        }

        //        throw new Exception("Failed to save leave request. Please try again.", ex);
        //    }
        //}

        public LeaveRequest SaveLeaveRequest(LeaveRequest leaveRequest)
        {
            // Validate input
            if (leaveRequest == null)
                throw new ArgumentNullException(nameof(leaveRequest));

            if (string.IsNullOrWhiteSpace(leaveRequest.EmpId))
                throw new ArgumentException("Employee ID (EmpId) is required and cannot be empty");
            bool isUpdate = false;
            LeaveRequest resultLeaveRequest;

            try
            {
                if (leaveRequest.ApplicationId > 0)
                {
                    // UPDATE existing record
                    var existing = _db.LeaveRequest.Find(leaveRequest.ApplicationId);
                    if (existing == null)
                        throw new KeyNotFoundException($"Leave request with ID {leaveRequest.ApplicationId} not found");

                    // Track status before update
                    var previousStatus = existing.Status;

                    // Update fields
                    existing.EmpId = leaveRequest.EmpId;
                    existing.Name = leaveRequest.Name ?? existing.Name;
                    existing.LeaveType = leaveRequest.LeaveType;
                    existing.StartDate = leaveRequest.StartDate;
                    existing.EndDate = leaveRequest.EndDate;
                    existing.Description = leaveRequest.Description;
                    existing.ManagerRemark = leaveRequest.ManagerRemark;
                    existing.Status = leaveRequest.Status;
                    existing.LeaveDuration = leaveRequest.LeaveDuration;
                    existing.To = leaveRequest.To;
                    existing.Cc = leaveRequest.Cc;
                    existing.LeaveCount = leaveRequest.LeaveCount;
                    existing.CreatedOn = leaveRequest.CreatedOn;
                    existing.ApprovalName = leaveRequest.ApprovalName;
                    existing.MailBody = leaveRequest.MailBody;

                    isUpdate = true;
                    _db.LeaveRequest.Update(existing);
                    _db.SaveChanges();
                    resultLeaveRequest = existing;

                    // ✅ Notify employee if status changed to Approved/Rejected
                    if (!string.Equals(previousStatus, leaveRequest.Status, StringComparison.OrdinalIgnoreCase))
                    {
                        if (leaveRequest.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase) ||
                            leaveRequest.Status.Equals("Rejected", StringComparison.OrdinalIgnoreCase))
                        {
                            try
                            {
                                var employee = _db.Users.FirstOrDefault(x => x.EmpId == existing.EmpId);
                                if (employee != null && !string.IsNullOrWhiteSpace(employee.Email))
                                {
                                    // ✅ Determine date text
                                    string dateText;
                                    if (existing.StartDate.Date == existing.EndDate.Date)
                                    {
                                        dateText = $"{existing.StartDate:dd MMM yyyy}";
                                    }
                                    else
                                    {
                                        dateText = $"{existing.StartDate:dd MMM yyyy} – {existing.EndDate:dd MMM yyyy}";
                                    }

                                    var subject = $"Your Leave Request has been {leaveRequest.Status}";
                                    var body = $@"
<p>Hi {employee.FirstName},</p>
<p>Your leave request has been <strong>{leaveRequest.Status}</strong> by your manager.</p>
<p>
<strong>Leave Type:</strong> {existing.LeaveType}<br/>
<strong>Date:</strong> {dateText}</p>
<p>You can view the status in the Employee Portal: 
<a href='http://60.254.115.242:8086/login-page/'>Employee Portal</a></p>";

                                    _emailService.SendEmailAsync(
                                        new List<string> { employee.Email },
                                        new List<string>(),
                                        subject,
                                        body
                                    ).Wait();
                                }
                            }
                            catch (Exception exMail)
                            {
                                // Log email failure if needed
                            }
                        }
                    }

                }
                else
                {
                    // INSERT new record
                    if (string.IsNullOrWhiteSpace(leaveRequest.Name))
                        throw new ArgumentException("Name is required for new leave requests");
                    leaveRequest.CreatedOn = DateTime.Now;
                    _db.LeaveRequest.Add(leaveRequest);
                    _db.SaveChanges();
                    resultLeaveRequest = leaveRequest;
                }

                // ✅ Notify reporting manager + To + Cc after save
                try
                {
                    var user = _db.Users.FirstOrDefault(x => x.EmpId == leaveRequest.EmpId);

                    // Collect recipients
                    var recipients = new List<string>();

                    if (user != null && !string.IsNullOrWhiteSpace(user.ReportingManager))
                    {
                        var reportingManager = _db.Users.FirstOrDefault(x => x.EmpId == user.ReportingManager);
                        if (reportingManager != null && !string.IsNullOrEmpty(reportingManager.Email))
                        {
                            recipients.Add(reportingManager.Email);
                        }
                    }

                    // Add additional recipients from LeaveRequest.To
                    if (!string.IsNullOrWhiteSpace(resultLeaveRequest.To))
                    {
                        recipients.AddRange(resultLeaveRequest.To
                            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(e => e.Trim()));
                    }

                    // Prepare CC recipients
                    var ccRecipients = new List<string>();
                    if (!string.IsNullOrWhiteSpace(resultLeaveRequest.Cc))
                    {
                        ccRecipients.AddRange(resultLeaveRequest.Cc
                            .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                            .Select(e => e.Trim()));
                    }

                    if (recipients.Any())
                    {
                        string subject, body;
                        var portalLink = "http://60.254.115.242:8086/";
                        var approveLink = $"{portalLink}api/LeaveRequest/Approve/{leaveRequest.ApplicationId}";
                        var rejectLink = $"{portalLink}api/LeaveRequest/Reject/{leaveRequest.ApplicationId}";

                        // ✅ Determine date text
                        string dateText;
                        if (leaveRequest.StartDate.Date == leaveRequest.EndDate.Date)
                        {
                            dateText = $"{leaveRequest.StartDate:dd MMM yyyy}";
                        }
                        else
                        {
                            dateText = $"{leaveRequest.StartDate:dd MMM yyyy} – {leaveRequest.EndDate:dd MMM yyyy}";
                        }

                        if (isUpdate)
                        {
                            subject = $"Unavailable ({dateText})";
                            body = $@"
<p>Hi Team,</p>
<p>Please note that my schedule has been <strong>updated</strong>. 
I will not be available on <strong>{dateText}</strong>.</p>
<p>Best regards,<br />{resultLeaveRequest.Name}</p>";
                        }
                        else
                        {
                            subject = $"Unavailable ({dateText})";
                            body = $@"
<p>Hi Team,</p>
<p>I will not be available on <strong>{dateText}</strong>.</p>
<p>Best regards,<br />{resultLeaveRequest.Name}</p>";
                        }

                        _emailService.SendEmailAsync(recipients, ccRecipients, subject, body).Wait();
                    }




                    // --- 2. Send approval email to ApprovalEmail only ---
                    if (!string.IsNullOrWhiteSpace(resultLeaveRequest.ApprovalEmail))
                    {
                        var approvalRecipients = new List<string> { resultLeaveRequest.ApprovalEmail.Trim() };

                        if (approvalRecipients.Any())
                        {
                          
                            if (!string.IsNullOrWhiteSpace(leaveRequest.Cc))
                            {
                                ccRecipients.AddRange(
                                    leaveRequest.Cc.Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                                    .Select(e => e.Trim())
                                );
                            }

                            // ✅ Portal links
                            var portalLink = "http://localhost:8082/";
                            var approveLink = $"{portalLink}api/LeaveRequest/Approve/{leaveRequest.ApplicationId}";
                            var rejectLink = $"{portalLink}api/LeaveRequest/Reject/{leaveRequest.ApplicationId}";

                            // ✅ Handle same start & end date
                            string dateText = leaveRequest.StartDate.Date == leaveRequest.EndDate.Date
                                ? $"{leaveRequest.StartDate:dd MMM yyyy}"
                                : $"{leaveRequest.StartDate:dd MMM yyyy} – {leaveRequest.EndDate:dd MMM yyyy}";

                            // ✅ Subject
                            var subject = isUpdate
                                ? $"Updated Leave Request ({dateText})"
                                : $"Leave Request ({dateText})";

                            // ✅ HTML Body
                            string body;
                            if (isUpdate)
                            {
                                body = $@"
<p>Hi Team,</p>
<p>Please note that my leave request has been <strong>updated</strong>. 
I will not be available on <strong>{dateText}</strong>.</p>
<p>Best regards,<br />{resultLeaveRequest.Name}</p>

<p><strong>Manager Action:</strong></p>
<table width='100%' cellpadding='0' cellspacing='0' border='0'>
<tr>
<td align='center' width='50%'>
<a href='{approveLink}' style='
    background-color: #28a745;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    display: inline-block;
    font-weight: bold;
    margin: 10px;
'>Approve</a>
</td>
<td align='center' width='50%'>
<a href='{rejectLink}' style='
    background-color: #dc3545;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    display: inline-block;
    font-weight: bold;
    margin: 10px;
'>Reject</a>
</td>
</tr>
</table>";
                            }
                            else
                            {
                                body = $@"
<p>Hi Team,</p>
<p>I would like to request leave from <strong>{dateText}</strong> due to {resultLeaveRequest.Description}</p>
<p>Thank you for your understanding</p>
<p>Best regards,<br />{resultLeaveRequest.Name}</p>

<p><strong>Manager Action:</strong></p>
<table width='100%' cellpadding='0' cellspacing='0' border='0'>
<tr>
<td align='center' width='50%'>
<a href='{approveLink}' style='
    background-color: #28a745;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    display: inline-block;
    font-weight: bold;
    margin: 10px;
'>Approve</a>
</td>
<td align='center' width='50%'>
<a href='{rejectLink}' style='
    background-color: #dc3545;
    color: white;
    padding: 12px 24px;
    text-decoration: none;
    border-radius: 4px;
    display: inline-block;
    font-weight: bold;
    margin: 10px;
'>Reject</a>
</td>
</tr>
</table>";
                            }

                            // ✅ Send Email
                            _emailService.SendEmailAsync(approvalRecipients, ccRecipients, subject, body).Wait();
                        }
                    }

                }
                catch (Exception emailEx)
                {
                    // log but don’t throw
                }

                return resultLeaveRequest;
            }
            catch (DbUpdateException ex)
            {
                if (ex.InnerException is SqlException sqlEx)
                {
                    switch (sqlEx.Number)
                    {
                        case 515: // NULL insert error
                            throw new InvalidOperationException(
                                "Failed to save leave request: Required fields are missing", ex);
                        case 547: // Foreign key violation
                            throw new InvalidOperationException(
                                "Failed to save leave request: Invalid employee reference", ex);
                    }
                }
                throw new Exception("Failed to save leave request. Please try again.", ex);
            }
            catch (Exception)
            {
                throw;
            }
        }


        public LeaveRequest UpdateLeaveStatus(int applicationId, string newStatus)
        {
            var leave = _db.LeaveRequest.FirstOrDefault(x => x.ApplicationId == applicationId);
            if (leave == null)
                throw new KeyNotFoundException($"Leave request with ID {applicationId} not found");

            leave.Status = newStatus;
            _db.LeaveRequest.Update(leave);
            _db.SaveChanges();

            // ✅ Send notification email to employee
            try
            {
                var employee = _db.Users.FirstOrDefault(x => x.EmpId == leave.EmpId);
                if (employee != null && !string.IsNullOrWhiteSpace(employee.Email))
                {
                    var subject = $"Your Leave Request has been {newStatus}";
                    var body = $@"
<p>Hi {employee.FirstName},</p>
<p>Your leave request has been <strong>{newStatus}</strong> by your manager.</p>
<p>
<strong>Leave Type:</strong> {leave.LeaveType}<br/>
<strong>Start Date:</strong> {leave.StartDate:dd MMM yyyy}<br/>
<strong>End Date:</strong> {leave.EndDate:dd MMM yyyy}
</p>
<p>You can check details on 
<a href='http://60.254.115.242:8084/login-page'>Employee Portal</a>.</p>";

                    _emailService.SendEmailAsync(
                        new List<string> { employee.Email },
                        new List<string>(),
                        subject,
                        body
                    ).Wait();
                }
            }
            catch (Exception ex)
            {
                // log exception if needed
            }

            return leave;
        }


        // Send email to manager and CC employee after leave request is saved
        private void SendLeaveRequestEmail(LeaveRequest leaveRequest)
        {
            // Get employee and manager info
            var user = _db.Users.FirstOrDefault(u => u.EmpId == leaveRequest.EmpId);
            if (user == null || string.IsNullOrEmpty(user.ReportingManager)) return;

            var manager = _db.Users.FirstOrDefault(u => u.UserName == user.ReportingManager || u.EmpId == user.ReportingManager);
            if (manager == null || string.IsNullOrEmpty(manager.Email)) return;

            string subject = "Leave Request";
            string body = $"Dear {manager.UserName},\n" +
                $"A new leave request has been submitted by {leaveRequest.Name} (EmpId: {leaveRequest.EmpId}).\n" +
                $"Leave Type: {leaveRequest.LeaveType}\n" +
                $"Start Date: {leaveRequest.StartDate:yyyy-MM-dd}\n" +
                $"End Date: {leaveRequest.EndDate:yyyy-MM-dd}\n" +
                $"Description: {leaveRequest.Description}\n" +
                $"Status: {leaveRequest.Status}\n" +
                 $"Status: {leaveRequest.LeaveDuration}\n" +
                $"Manager Remark: {leaveRequest.ManagerRemark}";

            //var emailService = new Service.EmailService(_configuration);
            //try
            //{
            //    // Send TO manager, CC employee
            //    emailService.SendEmail(manager.Email, subject, body, user.Email);
            //}
            //catch (Exception ex)
            //{
            //    // Optionally log error
            //}
        }

        // Send email to manager and CC employee after leave request is saved


        public LeaveRequest DeleteLeaveRequest(int id)
        {
            var leaveApp = _db.LeaveRequest.Find(id);
            if (leaveApp != null)
            {
                // ✅ Only send cancellation email if leave is pending
                if (leaveApp.Status != "Pending")
                {
                    try
                    {
                        // Get employee and manager info
                        var user = _db.Users.FirstOrDefault(u => u.EmpId == leaveApp.EmpId);
                        var manager = (user != null && !string.IsNullOrEmpty(user.ReportingManager))
                            ? _db.Users.FirstOrDefault(u => u.EmpId == user.ReportingManager)
                            : null;

                        var recipients = new List<string>();
                        if (manager != null && !string.IsNullOrEmpty(manager.Email))
                        {
                            recipients.Add(manager.Email);
                        }

                        // Add additional recipients
                        if (!string.IsNullOrWhiteSpace(leaveApp.To))
                        {
                            recipients.AddRange(leaveApp.To
                                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                                .Select(e => e.Trim()));
                        }

                        var ccRecipients = new List<string>();
                        if (!string.IsNullOrWhiteSpace(leaveApp.Cc))
                        {
                            ccRecipients.AddRange(leaveApp.Cc
                                .Split(new[] { ',', ';' }, StringSplitOptions.RemoveEmptyEntries)
                                .Select(e => e.Trim()));
                        }

                        if (recipients.Any())
                        {
                            var subject = $"Cancellation of Leave Request ({leaveApp.StartDate:dd MMM yyyy}" +
                                          (leaveApp.StartDate.Date != leaveApp.EndDate.Date
                                              ? $" – {leaveApp.EndDate:dd MMM yyyy}"
                                              : "") + ")";

                            string dateText;
                            if (leaveApp.StartDate.Date == leaveApp.EndDate.Date)
                            {
                                dateText = $"<strong>{leaveApp.StartDate:dd MMMM yyyy}</strong>";
                            }
                            else
                            {
                                dateText = $"<strong>{leaveApp.StartDate:dd MMMM yyyy}</strong> to <strong>{leaveApp.EndDate:dd MMMM yyyy}</strong>";
                            }

                            var body = $@"
<p>Hi Team,</p>
<p>I would like to inform you that I am cancelling my previously requested leave on {dateText}. 
Please disregard my earlier request for this period, as I will be available and working as usual on these dates.</p>
<p>Thank you for your understanding.</p>
<p>Best regards,<br/>{leaveApp.Name}</p>";

                            _emailService.SendEmailAsync(recipients, ccRecipients, subject, body).Wait();
                        }

                    }
                    catch (Exception exMail)
                    {
                        // log but don’t throw
                    }
                }

                // ✅ Delete after sending email
                _db.LeaveRequest.Remove(leaveApp);
                _db.SaveChanges();
            }

            return leaveApp;
        }




        public IEnumerable<LeaveRequest> GetLeaveRequestByEmpId(string id)
        {
            var result = from leaveRequest in _db.LeaveRequest
                         where leaveRequest.EmpId == id
                         select leaveRequest;
            return result;
        }
    }
}