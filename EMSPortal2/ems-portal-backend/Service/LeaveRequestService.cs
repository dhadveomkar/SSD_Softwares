using POCEmployeePortal.Models;
using POCEmployeePortal.Repository;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class LeaveRequestService : ILeaveRequestService
    {
        private readonly ILeaveRequestRepository _repository;

        public LeaveRequestService(ILeaveRequestRepository repository)
        {
            _repository = repository;
        }

        public IEnumerable<LeaveRequest> GetLeaveRequestByEmpId(string id)
        {
            return _repository.GetLeaveRequestByEmpId(id);
        }

        public LeaveRequest UpdateLeaveStatus(int applicationId, string newStatus)
             => _repository.UpdateLeaveStatus(applicationId, newStatus);

        public IEnumerable<LeaveRequest> GetLeaveRequests()
            => _repository.GetLeaveRequests();

        public LeaveRequest GetLeaveRequestById(int id)
            => _repository.GetLeaveRequestById(id);

        public LeaveRequest SaveLeaveRequest(LeaveRequest LeaveRequest)
            => _repository.SaveLeaveRequest(LeaveRequest);

        public LeaveRequest DeleteLeaveRequest(int id)
            => _repository.DeleteLeaveRequest(id);

      
    }
}