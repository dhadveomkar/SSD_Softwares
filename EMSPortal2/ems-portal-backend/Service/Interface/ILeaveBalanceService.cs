using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface ILeaveBalanceService
    {
        IEnumerable<LeaveBalance> GetLeaveBalances();
        LeaveBalance GetLeaveBalanceById(int id);
        LeaveBalance SaveLeaveBalance(LeaveBalance leaveBalance);
        LeaveBalance DeleteLeaveBalance(int id);
    }
}
