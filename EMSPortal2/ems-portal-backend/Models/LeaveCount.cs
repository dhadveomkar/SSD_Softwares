namespace POCEmployeePortal.Models
{
    public class LeaveCount
    {
        public int LeaveCountId { get; set; }

        public string TypeOfLeaveRequest { get; set; } = null!;
        public string CompanyName { get; set; } = null!;
        public int Count { get; set; }
        public string CreatedBy { get; set; } = null!;
        public DateTime CreatedOn { get; set; }
        public string ModifiedBy { get; set; } = null!;
        public DateTime ModifiedOn { get; set; }
        public bool IsDeleted { get; set; }

        public bool? IsSatSun { get; set; }
    }
}
