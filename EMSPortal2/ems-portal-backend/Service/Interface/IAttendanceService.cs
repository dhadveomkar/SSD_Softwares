using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface IAttendanceService
    {
        IEnumerable<Attendance> GetAttendances();
        Attendance GetAttendanceById(int id);
        Attendance SaveAttendance(Attendance attendance);
        Attendance DeleteAttendance(int id);
        IEnumerable<Attendance> GetAttendanceByEmpId(string id);
    }
}
