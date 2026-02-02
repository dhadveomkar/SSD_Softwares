using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class Project
    {
        public int ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
