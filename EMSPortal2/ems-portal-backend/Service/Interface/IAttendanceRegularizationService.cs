using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface IAttendanceRegularizationService
    {
        IEnumerable<AttendanceRegularization> GetAllAttendanceRegularizations();
        AttendanceRegularization GetAttendanceRegularizationById(int id);
        AttendanceRegularization SaveAttendanceRegularization(AttendanceRegularization attendanceRegularization);
        AttendanceRegularization DeleteAttendanceRegularization(int id);

        IEnumerable<AttendanceRegularization> GetAttendanceRegularizationByEmpId(string id);
    }
}
