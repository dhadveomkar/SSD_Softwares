using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class LeaveType
    {
        public int LeaveTypeId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public int MaxDays { get; set; }
    }
}
