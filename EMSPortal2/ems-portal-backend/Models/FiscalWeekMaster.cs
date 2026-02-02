namespace POCEmployeePortal.Models
{
    public class FiscalWeekMaster
    {
        public int FiscalWeekId { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int WeekNo { get; set; }
        public int FiscalYear { get; set; }
    }
}
