using POCEmployeePortal.Models;

namespace POCEmployeePortal.Service.Interface
{
    public interface IOfficeAddressService
    {
        IEnumerable<OfficeAddress> GetOfficeAddresses();
        OfficeAddress GetOfficeAddressById(int id);
    }
}
