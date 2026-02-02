using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using System.Collections.Generic;

namespace POCEmployeePortal.Service
{
    public class LeaveCountService : Interface.ILeaveCountService
    {
        private readonly ILeaveCountRepository _leaveCountRepository;

        public LeaveCountService(ILeaveCountRepository leaveCountRepository)
        {
            _leaveCountRepository = leaveCountRepository;
        }

        public IEnumerable<LeaveCount> GetAll()
        {
            return _leaveCountRepository.GetAll();
        }

        public LeaveCount? GetById(string typeOfLeaveRequest, string companyName)
        {
            return _leaveCountRepository.GetById(typeOfLeaveRequest, companyName);
        }

        public void Add(LeaveCount leaveCount)
        {
            _leaveCountRepository.Add(leaveCount);
        }

        public void Update(LeaveCount leaveCount)
        {
            _leaveCountRepository.Update(leaveCount);
        }

        public void Delete(string typeOfLeaveRequest, string companyName)
        {
            _leaveCountRepository.Delete(typeOfLeaveRequest, companyName);
        }
    }
}