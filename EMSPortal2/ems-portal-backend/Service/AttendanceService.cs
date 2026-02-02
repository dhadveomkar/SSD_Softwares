using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;


namespace POCEmployeePortal.Services
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IAttendanceRepository _attendanceRepo;

        public AttendanceService(IAttendanceRepository attendanceRepo)
        {
            _attendanceRepo = attendanceRepo;
        }

        public IEnumerable<Attendance> GetAttendances()
        {
            return _attendanceRepo.GetAttendances();
        }

        public Attendance GetAttendanceById(int id)
        {
            return _attendanceRepo.GetAttendanceById(id);
        }

        public Attendance SaveAttendance(Attendance attendance)
        {
            return _attendanceRepo.SaveAttendance(attendance);
        }

        public Attendance DeleteAttendance(int id)
        {
            return _attendanceRepo.DeleteAttendance(id);
        }

        public IEnumerable<Attendance> GetAttendanceByEmpId(string id)
        {
            return _attendanceRepo.GetAttendanceByEmpId(id);
        }
    }
}