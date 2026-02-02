using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class LeaveTypeService : ILeaveTypeService
    {
        private readonly ILeaveTypeRepository _repository;

        public LeaveTypeService(ILeaveTypeRepository repository)
        {
            _repository = repository;
        }

        public IEnumerable<LeaveType> GetLeaveTypes()
            => _repository.GetLeaveTypes();

        public LeaveType GetLeaveTypeById(int id)
            => _repository.GetLeaveTypeById(id);

        public LeaveType SaveLeaveType(LeaveType leaveType)
            => _repository.SaveLeaveType(leaveType);

        public LeaveType DeleteLeaveType(int id)
            => _repository.DeleteLeaveType(id);
    }
}