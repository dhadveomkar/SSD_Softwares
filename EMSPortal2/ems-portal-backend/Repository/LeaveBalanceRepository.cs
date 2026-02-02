using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class LeaveBalanceRepository : ILeaveBalanceRepository
    {
        private readonly POCEmployeePortalContext _db;

        public LeaveBalanceRepository(POCEmployeePortalContext db)
        {
            _db = db;
        }

        public IEnumerable<LeaveBalance> GetLeaveBalances()
            => _db.LeaveBalances.ToList();

        public LeaveBalance GetLeaveBalanceById(int id)
            => _db.LeaveBalances.FirstOrDefault(l => l.BalanceId == id);

        public IEnumerable<LeaveBalance> GetLeaveBalanceByEmployeeId(int id)
            => _db.LeaveBalances.Where(l => l.BalanceId == id).ToList();

        public LeaveBalance SaveLeaveBalance(LeaveBalance leaveBalance)
        {
            if (leaveBalance == null) return null;

            if (leaveBalance.BalanceId > 0)
            {
                // Update existing record
                var existing = _db.LeaveBalances.Find(leaveBalance.BalanceId);
                if (existing != null)
                {
                    existing.EmpId = leaveBalance.EmpId;
                    existing.LeaveTypeId = leaveBalance.LeaveTypeId;
                    existing.Balance = leaveBalance.Balance;
                }
            }
            else
            {
                // Insert new record
                _db.LeaveBalances.Add(leaveBalance);
            }

            _db.SaveChanges();
            return leaveBalance;
        }

        public LeaveBalance DeleteLeaveBalance(int id)
        {
            var leaveBalance = _db.LeaveBalances.Find(id);
            if (leaveBalance != null)
            {
                _db.LeaveBalances.Remove(leaveBalance);
                _db.SaveChanges();
            }
            return leaveBalance;
        }
    }
}