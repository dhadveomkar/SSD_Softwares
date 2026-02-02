using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class TimeEntry
    {
        public int EntryId { get; set; }
        public string EmpId { get; set; } = null!;
        public int ProjectTaskId { get; set; }
        public DateTime Date { get; set; }
        public decimal Hours { get; set; }
        public string? Description { get; set; }
    }
}
