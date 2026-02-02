using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class LeaveTypeRepository : ILeaveTypeRepository
    {
        private readonly POCEmployeePortalContext _db;

        public LeaveTypeRepository(POCEmployeePortalContext db)
        {
            _db = db;
        }

        public IEnumerable<LeaveType> GetLeaveTypes()
            => _db.LeaveTypes.ToList();

        public LeaveType GetLeaveTypeById(int id)
            => _db.LeaveTypes.FirstOrDefault(l => l.LeaveTypeId == id);

        public LeaveType SaveLeaveType(LeaveType leaveType)
        {
            if (leaveType == null) return null;

            if (leaveType.LeaveTypeId > 0)
            {
                // Update existing record
                var existing = _db.LeaveTypes.Find(leaveType.LeaveTypeId);
                if (existing != null)
                {
                    existing.Name = leaveType.Name;
                    existing.Description = leaveType.Description;
                    existing.MaxDays = leaveType.MaxDays;
                }
            }
            else
            {
                // Insert new record
                _db.LeaveTypes.Add(leaveType);
            }

            _db.SaveChanges();
            return leaveType;
        }

        public LeaveType DeleteLeaveType(int id)
        {
            var leaveType = _db.LeaveTypes.Find(id);
            if (leaveType != null)
            {
                _db.LeaveTypes.Remove(leaveType);
                _db.SaveChanges();
            }
            return leaveType;
        }
    }
}