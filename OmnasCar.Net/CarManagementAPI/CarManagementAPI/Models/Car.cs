namespace CarManagementAPI.Models
{
    public class Car
    {
        public int CarID { get; set; }
        public required string ModelName { get; set; }
        public required string Brand { get; set; }
        public int Year { get; set; }
        public decimal Price { get; set; }
        public int CategoryID { get; set; }
        // This property is populated by the JOIN in sp_GetAllCars
        public string? CategoryName { get; set; }
    }
}
