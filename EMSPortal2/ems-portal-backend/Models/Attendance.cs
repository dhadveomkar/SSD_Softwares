using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class Attendance
    {
        public int AttendanceId { get; set; }
        public string EmpId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public string Shift { get; set; } = null!;
        public DateTime Date { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public TimeSpan? WorkingHours { get; set; }
        public string? Description { get; set; }
        public string? ManagerRemark { get; set; }
        public string? Status { get; set; }
    }
}
