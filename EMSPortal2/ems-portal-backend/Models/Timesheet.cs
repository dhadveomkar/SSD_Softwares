using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class Timesheet
    {
        public int Id { get; set; }
        public string EmpId { get; set; } = null!;
        public string? UserName { get; set; }
        public DateTime CreatedDate { get; set; }
        public string FilePath { get; set; } = null!;
        public string ProjectManager { get; set; }
        public int ComapnyId { get; set; }
        public int RoleId { get; set; }
    }
}
