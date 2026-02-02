namespace POCEmployeePortal.Models
{
    public class LeaveProData
    {
        public int Id { get; set; }

        public string Month { get; set; } = string.Empty;

        public decimal PaidLeaveBefore15 { get; set; }
        public decimal PaidLeaveAfter15 { get; set; }

        public decimal SickLeaveCasualLeaveBefore15 { get; set; }
        public decimal SickLeaveCasualLeaveAfter15 { get; set; }

        public decimal FlexHoliday { get; set; }
    }
}
