using System;

namespace POCEmployeePortal.Models
{
    public partial class CompanyDetail
    {
        public int CompanyId { get; set; }
        public string? CompanyName { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
    }
}
