using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface IAttendanceRepository
    {      
        IEnumerable<Attendance> GetAttendances();
        Attendance GetAttendanceById(int id);
        Attendance SaveAttendance(Attendance attendance);
        Attendance DeleteAttendance(int id);
        IEnumerable<Attendance> GetAttendanceByEmpId(string id);
    }
}
