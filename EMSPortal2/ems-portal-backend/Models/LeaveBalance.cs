using System;
using System.Collections.Generic;

namespace POCEmployeePortal.Models
{
    public partial class LeaveBalance
    {
        public int BalanceId { get; set; }
        public string EmpId { get; set; } = null!;
        public int LeaveTypeId { get; set; }
        public int Balance { get; set; }
    }
}
