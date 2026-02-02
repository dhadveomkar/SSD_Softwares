using POCEmployeePortal.Models;
using System.Collections.Generic;

namespace POCEmployeePortal.Service.Interface
{
    public interface ILeaveCountService
    {
        IEnumerable<LeaveCount> GetAll();
        LeaveCount? GetById(String typeOfLeaveRequest, string companyName);
        void Add(LeaveCount leaveCount);
        void Update(LeaveCount leaveCount);
        void Delete(string typeOfLeaveRequest, string companyName);
    }
}