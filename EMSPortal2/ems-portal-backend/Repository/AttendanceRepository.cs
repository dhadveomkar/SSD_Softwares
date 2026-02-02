using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class AttendanceRepository : IAttendanceRepository
    {
        private readonly POCEmployeePortalContext db;
        private readonly IConfiguration _configuration;

        public AttendanceRepository(POCEmployeePortalContext db, IConfiguration configuration)
        {
            this.db = db;
            _configuration = configuration;
        }

        public IEnumerable<Attendance> GetAttendances()
        {
            var result = from attendance in db.Attendances
                         select attendance;
            return result;
        }

        public Attendance GetAttendanceById(int id)
        {
            var result = (from attendance in db.Attendances
                          where attendance.AttendanceId == id
                          select attendance).FirstOrDefault();
            return result;
        }

        public Attendance SaveAttendance(Attendance attendance)
        {
            if (attendance == null)
                return null;

            if (attendance.CheckOut > attendance.CheckIn)
            {
                attendance.WorkingHours = attendance.CheckOut - attendance.CheckIn;
            }
            else
            {
                attendance.WorkingHours = null; // Invalid case or not yet checked out
            }

            bool isUpdate = false;
            if (attendance.AttendanceId > 0)
            {
                // Check if record exists
                var existingRecord = db.Attendances.FirstOrDefault(x => x.AttendanceId == attendance.AttendanceId);
                if (existingRecord != null)
                {
                    // Update existing record
                    existingRecord.EmpId = attendance.EmpId;
                    existingRecord.Name = attendance.Name;
                    existingRecord.Shift = attendance.Shift;
                    existingRecord.Date = attendance.Date;
                    existingRecord.CheckIn = attendance.CheckIn;
                    existingRecord.CheckOut = attendance.CheckOut;
                    existingRecord.WorkingHours = attendance.WorkingHours;
                    existingRecord.Status = attendance.Status;
                    existingRecord.Description = attendance.Description;
                    existingRecord.ManagerRemark = attendance.ManagerRemark;
                    db.SaveChanges();
                    isUpdate = true;
                }
                else
                {
                    // Insert new record, generate ID
                    Attendance newRecord = new Attendance
                    {
                        EmpId = attendance.EmpId,
                        Name = attendance.Name,
                        Shift = attendance.Shift,
                        Date = attendance.Date,
                        CheckIn = attendance.CheckIn,
                        CheckOut = attendance.CheckOut,
                        WorkingHours = attendance.WorkingHours,
                        Status = attendance.Status,
                        Description = attendance.Description,
                        ManagerRemark = attendance.ManagerRemark
                    };

                    db.Attendances.Add(newRecord);
                    db.SaveChanges();

                    attendance.AttendanceId = newRecord.AttendanceId; // Update input with generated ID
                }
            }
            else
            {
                // New record - let EF handle ID generation
                db.Attendances.Add(attendance);
                db.SaveChanges();
            }

            // After save, trigger email to manager
           // SendAttendanceEmail(attendance);
            return attendance;
        }
        private void SendAttendanceEmail(Attendance attendance)
        {
            // Get employee and manager info
            var user = db.Users.FirstOrDefault(u => u.EmpId == attendance.EmpId);
            if (user == null || string.IsNullOrEmpty(user.ReportingManager)) return;

            var manager = db.Users.FirstOrDefault(u => u.UserName == user.ReportingManager || u.EmpId == user.ReportingManager);
            if (manager == null || string.IsNullOrEmpty(manager.Email)) return;

            string subject = "Attendance";
            string body = $"Dear {manager.FirstName},\n" +
                $"Attendance Data:\n" +
                $"Name: {attendance.Name}\n" +
                $"Date: {attendance.Date:yyyy-MM-dd}\n" +
         
                $"WorkingHours: {attendance.WorkingHours}\n" +
                $"Status: {attendance.Status}\n" +
                $"Description: {attendance.Description}\n" +
                $"ManagerRemark: {attendance.ManagerRemark}";

            //var emailService = new Service.EmailService(_configuration);
            //try
            //{
            //    emailService.SendEmail(manager.Email, subject, body);
            //}
            //catch (Exception ex)
            //{
            //    // Optionally log error
            //}
        }
        

        public Attendance DeleteAttendance(int id)
        {
            int result = 0;
            var record = db.Attendances.Where(x => x.AttendanceId == id).FirstOrDefault();
            if (record != null)
            {
                db.Attendances.Remove(record);
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




        public IEnumerable<Attendance> GetAttendanceByEmpId(string id)
        {
            var result = from attendance in db.Attendances
                         where attendance.EmpId == id
                         select attendance;
            return result;
        }

    }
}