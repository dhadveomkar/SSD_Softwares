namespace CarManagementAPI.Models
{
    public class MaintenanceLog
    {
        public int LogID { get; set; }
        public int CarID { get; set; }
        public DateTime ServiceDate { get; set; }
        public string? Description { get; set; }
        public decimal Cost { get; set; }
    }
}
