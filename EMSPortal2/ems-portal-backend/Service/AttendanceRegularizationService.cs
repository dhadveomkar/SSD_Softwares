using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;
using System.Collections.Generic;

namespace POCEmployeePortal.Services
{
    public class AttendanceRegularizationService : IAttendanceRegularizationService
    {
        private readonly IAttendanceRegularizationRepository _attendanceRegularizationRepo;

        public AttendanceRegularizationService(IAttendanceRegularizationRepository attendanceRegularizationRepo)
        {
            _attendanceRegularizationRepo = attendanceRegularizationRepo;
        }

        public IEnumerable<AttendanceRegularization> GetAllAttendanceRegularizations()
        {
            return _attendanceRegularizationRepo.GetAllAttendanceRegularizations();
        }

        public AttendanceRegularization GetAttendanceRegularizationById(int id)
        {
            return _attendanceRegularizationRepo.GetAttendanceRegularizationById(id);
        }

        public AttendanceRegularization SaveAttendanceRegularization(AttendanceRegularization attendanceRegularization)
        {
            return _attendanceRegularizationRepo.SaveAttendanceRegularization(attendanceRegularization);
        }

        public AttendanceRegularization DeleteAttendanceRegularization(int id)
        {
            return _attendanceRegularizationRepo.DeleteAttendanceRegularization(id);
        }

        public IEnumerable<AttendanceRegularization> GetAttendanceRegularizationByEmpId(string id)
        {
            return _attendanceRegularizationRepo.GetAttendanceRegularizationByEmpId(id);
        }

    }
}