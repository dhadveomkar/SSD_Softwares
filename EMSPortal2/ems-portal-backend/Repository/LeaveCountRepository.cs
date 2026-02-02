using POCEmployeePortal.Models;
using POCEmployeePortal.Models;
using System.Collections.Generic;
using System.Linq;

namespace POCEmployeePortal.Repository
{
    public class LeaveCountRepository : Interface.ILeaveCountRepository
    {
        private readonly POCEmployeePortalContext _context;

        public LeaveCountRepository(POCEmployeePortalContext context)
        {
            _context = context;
        }

        public IEnumerable<LeaveCount> GetAll()
        {
            return _context.LeaveCount.ToList();
        }

        public LeaveCount? GetById(string typeOfLeaveRequest, string companyName)
        {
            return _context.LeaveCount.FirstOrDefault(lc => lc.TypeOfLeaveRequest == typeOfLeaveRequest && lc.CompanyName == companyName);
        }

        public void Add(LeaveCount leaveCount)
        {
            _context.LeaveCount.Add(leaveCount);
            _context.SaveChanges();
        }

        public void Update(LeaveCount leaveCount)
        {
            _context.LeaveCount.Update(leaveCount);
            _context.SaveChanges();
        }

        public void Delete(string typeOfLeaveRequest, string companyName)
        {
            var leaveCount = GetById(typeOfLeaveRequest, companyName);
            if (leaveCount != null)
            {
                _context.LeaveCount.Remove(leaveCount);
                _context.SaveChanges();
            }
        }
    }
}