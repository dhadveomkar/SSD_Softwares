using OfficeOpenXml;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class DailyTaskRepository : IDailyTaskRepository
    {
        private readonly POCEmployeePortalContext db;
        private readonly IConfiguration _configuration;

        public DailyTaskRepository(POCEmployeePortalContext db, IConfiguration configuration)
        {
            this.db = db;
            _configuration = configuration;
        }

        public IEnumerable<DailyTask> GetDailyTasks()
        {
            var result = from dailyTask in db.DailyTasks
                         select dailyTask;
            return result;
        }

        public DailyTask GetDailyTaskById(int id)
        {
            var result = (from dailyTask in db.DailyTasks
                          where dailyTask.TaskId == id
                          select dailyTask).FirstOrDefault();
            return result;
        }

        //public DailyTask SaveDailyTask(DailyTask dailyTask)
        //{
        //    if (dailyTask == null)
        //        return null;

        //    if (dailyTask.TaskId > 0)
        //    {
        //        // Check if record exists
        //        var existingRecord = db.DailyTasks.FirstOrDefault(x => x.TaskId == dailyTask.TaskId);
        //        if (existingRecord != null)
        //        {
        //            // Update existing record
        //            existingRecord.EmpId = dailyTask.EmpId;
        //            existingRecord.Name = dailyTask.Name;
        //            existingRecord.TaskDetails = dailyTask.TaskDetails;
        //            existingRecord.StartDate = dailyTask.StartDate;
        //            existingRecord.EndDate = dailyTask.EndDate;
        //            existingRecord.EstimatedHrs = dailyTask.EstimatedHrs;
        //            existingRecord.CompletedInHrs = dailyTask.CompletedInHrs;
        //            existingRecord.Status = dailyTask.Status;
        //            existingRecord.Comment = dailyTask.Comment;          
        //            db.SaveChanges();
        //            return dailyTask;
        //        }
        //        else
        //        {
        //            // Insert new record, generate ID
        //            DailyTask newRecord = new DailyTask
        //            {
        //                EmpId = dailyTask.EmpId,
        //                Name = dailyTask.Name,
        //                TaskDetails = dailyTask.TaskDetails,
        //                StartDate = dailyTask.StartDate,
        //                EndDate = dailyTask.EndDate,
        //                EstimatedHrs = dailyTask.EstimatedHrs,
        //                CompletedInHrs = dailyTask.CompletedInHrs,
        //                Status = dailyTask.Status,
        //                Comment = dailyTask.Comment,               
        //            };

        //            db.DailyTasks.Add(newRecord);
        //            db.SaveChanges();

        //            dailyTask.TaskId = newRecord.TaskId; // Update input with generated ID
        //            return dailyTask;
        //        }
        //    }
        //    else
        //    {
        //        // New record - let EF handle ID generation
        //        db.DailyTasks.Add(dailyTask);
        //        db.SaveChanges();
        //        return dailyTask;
        //    }
        //}

        public List<DailyTask> SaveDailyTask(List<DailyTask> dailyTasks)
        {
            if (dailyTasks == null || !dailyTasks.Any())
                return new List<DailyTask>();

            // Split into new vs. existing records
            var newTasks = dailyTasks.Where(t => t.TaskId <= 0).ToList();
            var existingTasks = dailyTasks.Where(t => t.TaskId > 0).ToList();

            // Bulk insert new records
            db.DailyTasks.AddRange(newTasks);

            // Update existing records
            foreach (var dailyTask in existingTasks)
            {
                var existingRecord = db.DailyTasks.FirstOrDefault(t => t.TaskId == dailyTask.TaskId);
                if (existingRecord != null)
                {
                    existingRecord.EmpId = dailyTask.EmpId;
                    existingRecord.Name = dailyTask.Name;
                    existingRecord.TaskDetails = dailyTask.TaskDetails;
                    existingRecord.StartDate = dailyTask.StartDate;
                    existingRecord.EndDate = dailyTask.EndDate;
                    existingRecord.EstimatedHours = dailyTask.EstimatedHours;
                    existingRecord.CompletedInHours = dailyTask.CompletedInHours;
                    existingRecord.Status = dailyTask.Status;
                    existingRecord.Comment = dailyTask.Comment;
                    existingRecord.ManagerRemark = dailyTask.ManagerRemark;
                }
            }

            db.SaveChanges();

            // After save, trigger email to manager for each task
            foreach (var task in dailyTasks)
            {
              //  SendDailyTaskEmail(task);
            }

            return dailyTasks;
        }

        public async Task UploadDailyTaskExcelAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                throw new Exception("No file uploaded.");

            using (var stream = new MemoryStream())
            {
                await file.CopyToAsync(stream);

                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets.First();
                    int rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++) // assuming first row is header
                    {
                        var task = new DailyTask
                        {
                            StartDate = DateTime.TryParse(worksheet.Cells[row, 1].Text, out var sDate) ? sDate : DateTime.MinValue,
                            EndDate = DateTime.TryParse(worksheet.Cells[row, 2].Text, out var eDate) ? eDate : DateTime.MinValue,
                            EstimatedHours = decimal.TryParse(worksheet.Cells[row, 3].Text, out var estHours) ? estHours : 0,
                            CompletedInHours = decimal.TryParse(worksheet.Cells[row, 4].Text, out var actHours) ? actHours : 0,
                            TaskDetails = worksheet.Cells[row, 5].Text,
                            Status = worksheet.Cells[row, 6].Text,
                            ProjectName = worksheet.Cells[row, 7].Text,
                            ManagerName = worksheet.Cells[row, 8].Text,
                            Name = worksheet.Cells[row, 9].Text, // Employee Name
                            EmpId = worksheet.Cells[row, 10].Text, // EID
                            Comment = worksheet.Cells[row, 11].Text
                        };

                        db.DailyTasks.Add(task);
                    }

                    await db.SaveChangesAsync();
                }
            }
        }

        // Send email to manager and CC employee after daily task is saved
        private void SendDailyTaskEmail(DailyTask dailyTask)
        {
            var user = db.Users.FirstOrDefault(u => u.EmpId == dailyTask.EmpId);
            if (user == null || string.IsNullOrEmpty(user.ReportingManager)) return;

            var manager = db.Users.FirstOrDefault(u => u.UserName == user.ReportingManager || u.EmpId == user.ReportingManager);
            if (manager == null || string.IsNullOrEmpty(manager.Email)) return;

            string subject = "Daily Task Update";
            string body = $"Dear {manager.UserName},\n" +
                $"A daily task has been submitted/updated by {dailyTask.Name} (EmpId: {dailyTask.EmpId}).\n" +
                $"Task Details: {dailyTask.TaskDetails}\n" +
                $"Start Date: {dailyTask.StartDate:yyyy-MM-dd}\n" +
                $"End Date: {dailyTask.EndDate:yyyy-MM-dd}\n" +
                $"Estimated Hours: {dailyTask.EstimatedHours}\n" +
                $"Completed In Hours: {dailyTask.CompletedInHours}\n" +
                $"Status: {dailyTask.Status}\n" +
                $"Comment: {dailyTask.Comment}\n" +
                $"Manager Remark: {dailyTask.ManagerRemark}";

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

        public DailyTask DeleteDailyTask(int id)
        {
            int result = 0;
            var record = db.DailyTasks.Where(x => x.TaskId == id).FirstOrDefault();
            if (record != null)
            {
                db.DailyTasks.Remove(record);
                result = db.SaveChanges();
            }

            if (result > 0)
            {
                return record;
            }
            else
            {
                return null;
            }
        }

        public IEnumerable<DailyTask> GetDailyTaskByEmpId(string id)
        {
            var result = from dailyTask in db.DailyTasks
                         where dailyTask.EmpId == id
                         select dailyTask;
            return result;
        }
    }
}
