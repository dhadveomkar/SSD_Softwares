using POCEmployeePortal.Models;
using System.Collections.Generic;

namespace POCEmployeePortal.Repository.Interface
{
    public interface ILeaveCountRepository
    {
        IEnumerable<LeaveCount> GetAll();
        LeaveCount? GetById(string typeOfLeaveRequest, string companyName);
        void Add(LeaveCount leaveCount);
        void Update(LeaveCount leaveCount);
        void Delete(string typeOfLeaveRequest, string companyName);
    }
}