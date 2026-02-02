using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class OfficeAddress
    {
        public int AddressId { get; set; }
        public string CompanyName { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string City { get; set; } = null!;
        public string State { get; set; } = null!;
        public string Country { get; set; } = null!;
    }
}
