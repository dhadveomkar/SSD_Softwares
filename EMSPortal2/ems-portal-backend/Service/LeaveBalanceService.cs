using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class LeaveBalanceService : ILeaveBalanceService
    {
        private readonly ILeaveBalanceRepository _repository;

        public LeaveBalanceService(ILeaveBalanceRepository repository)
        {
            _repository = repository;
        }

        public IEnumerable<LeaveBalance> GetLeaveBalances()
            => _repository.GetLeaveBalances();

        public LeaveBalance GetLeaveBalanceById(int id)
            => _repository.GetLeaveBalanceById(id);

        public LeaveBalance SaveLeaveBalance(LeaveBalance leaveBalance)
            => _repository.SaveLeaveBalance(leaveBalance);

        public LeaveBalance DeleteLeaveBalance(int id)
            => _repository.DeleteLeaveBalance(id);
    }
}