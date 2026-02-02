using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class AttendanceRegularization
    {
        public int RequestId { get; set; }
        public string EmpId { get; set; } = null!;
        public DateTime Date { get; set; }
        public string Shift { get; set; } = null!;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public TimeSpan? WorkingHours { get; set; }
        public string? Reason { get; set; }
        public string? Status { get; set; }
    }
}
