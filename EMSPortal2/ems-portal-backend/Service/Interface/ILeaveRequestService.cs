using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface ILeaveRequestService
    {
        IEnumerable<LeaveRequest> GetLeaveRequests();
        LeaveRequest GetLeaveRequestById(int id);

        LeaveRequest UpdateLeaveStatus(int applicationId, string newStatus);
        LeaveRequest SaveLeaveRequest(LeaveRequest LeaveRequest);
        LeaveRequest DeleteLeaveRequest(int id);
        IEnumerable<LeaveRequest> GetLeaveRequestByEmpId(string id);

    }
}
