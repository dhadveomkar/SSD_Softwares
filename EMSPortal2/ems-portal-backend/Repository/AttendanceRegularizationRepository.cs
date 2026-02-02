using Microsoft.EntityFrameworkCore;
using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using System.Collections.Generic;
using System.Linq;

namespace POCEmployeePortal.Repository
{
    public class AttendanceRegularizationRepository : IAttendanceRegularizationRepository
    {
        private readonly POCEmployeePortalContext _db;

        public AttendanceRegularizationRepository(POCEmployeePortalContext db)
        {
            _db = db;
        }

        public IEnumerable<AttendanceRegularization> GetAllAttendanceRegularizations()
        {
            return _db.AttendanceRegularizations.AsEnumerable();
        }

        public AttendanceRegularization GetAttendanceRegularizationById(int id)
        {
            return _db.AttendanceRegularizations
                     .FirstOrDefault(a => a.RequestId == id);
        }

        public AttendanceRegularization SaveAttendanceRegularization(AttendanceRegularization regularization)
        {
            if (regularization == null)
                return null;

            // Validate check-out is after check-in
            if (regularization.CheckOut <= regularization.CheckIn)
            {
                regularization.CheckOut = regularization.CheckIn.AddHours(1); // Default 1 hour if invalid
            }

            if (regularization.RequestId > 0)
            {
                // Update existing record
                var existingRecord = _db.AttendanceRegularizations
                                      .FirstOrDefault(a => a.RequestId == regularization.RequestId);

                if (existingRecord != null)
                {
                    existingRecord.EmpId = regularization.EmpId;
                    existingRecord.Date = regularization.Date;
                    existingRecord.Shift = regularization.Shift;
                    existingRecord.CheckIn = regularization.CheckIn;
                    existingRecord.CheckOut = regularization.CheckOut;
                    //existingRecord.Description = regularization.Description;
                    
                    _db.SaveChanges();
                    return existingRecord;
                }
            }

            // Insert new record
            _db.AttendanceRegularizations.Add(regularization);
            _db.SaveChanges();
            return regularization;
        }

        public AttendanceRegularization DeleteAttendanceRegularization(int id)
        {
            var record = _db.AttendanceRegularizations
                          .FirstOrDefault(a => a.RequestId == id);

            if (record != null)
            {
                _db.AttendanceRegularizations.Remove(record);
                _db.SaveChanges();
                return record;
            }

            return null;
        }


        public IEnumerable<AttendanceRegularization> GetAttendanceRegularizationByEmpId(string id)
        {
            var result = from attendanceRegularization in _db.AttendanceRegularizations
                         where attendanceRegularization.EmpId == id
                         select attendanceRegularization;
            return result;
        }

    }
}