using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class Holiday
    {
        public int HolidayId { get; set; }
        public DateTime Date { get; set; }
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? Type { get; set; }
        public string? HolidaySet { get; set; }
    }
}
