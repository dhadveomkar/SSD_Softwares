using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface ILeaveTypeService
    {
        IEnumerable<LeaveType> GetLeaveTypes();
        LeaveType GetLeaveTypeById(int id);
        LeaveType SaveLeaveType(LeaveType leaveType);
        LeaveType DeleteLeaveType(int id);
    }
}
