namespace CarManagementAPI.Models
{
    public class CarSearchCriteria
    {
        public string? Brand { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? Year { get; set; }
    }
}
