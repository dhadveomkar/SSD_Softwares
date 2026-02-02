using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class ProjectTask
    {
        public int ProjectTaskId { get; set; }
        public int ProjectId { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; }
    }
}
