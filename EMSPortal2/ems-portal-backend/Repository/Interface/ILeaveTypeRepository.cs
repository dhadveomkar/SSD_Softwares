using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface ILeaveTypeRepository
    {
        IEnumerable<LeaveType> GetLeaveTypes();
        LeaveType GetLeaveTypeById(int id);
        LeaveType SaveLeaveType(LeaveType leaveType);
        LeaveType DeleteLeaveType(int id);
    }
}
