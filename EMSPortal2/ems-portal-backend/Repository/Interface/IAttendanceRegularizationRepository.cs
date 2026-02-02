using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface IAttendanceRegularizationRepository
    {
       
            IEnumerable<AttendanceRegularization> GetAllAttendanceRegularizations();
            AttendanceRegularization GetAttendanceRegularizationById(int id);
            AttendanceRegularization SaveAttendanceRegularization(AttendanceRegularization attendanceRegularization);
            AttendanceRegularization DeleteAttendanceRegularization(int id);

            IEnumerable<AttendanceRegularization> GetAttendanceRegularizationByEmpId(string id);

    }
}
