using POCEmployeePortal.Models;

namespace POCEmployeePortal.Repository.Interface
{
    public interface IOfficeAddressRepository
    {
        IEnumerable<OfficeAddress> GetOfficeAddresses();
        OfficeAddress GetOfficeAddressById(int id);
    }
}
