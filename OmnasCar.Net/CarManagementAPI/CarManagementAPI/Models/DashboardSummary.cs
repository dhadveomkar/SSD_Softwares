namespace CarManagementAPI.Models
{
    public class DashboardSummary
    {
        public int TotalCars { get; set; }
        public decimal TotalInventoryValue { get; set; }
        public List<CategoryCount>? CarsByCategory { get; set; }
        public Car? MostExpensiveCar { get; set; }
    }

    public class CategoryCount
    {
        public string? CategoryName { get; set; }
        public int Count { get; set; }
    }
}
