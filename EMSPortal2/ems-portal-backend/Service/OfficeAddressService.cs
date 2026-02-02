using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;
using POCEmployeePortal.Service.Interface;

namespace POCEmployeePortal.Service
{
    public class OfficeAddressService : IOfficeAddressService
    {
        private readonly IOfficeAddressRepository _OfficeAddressRepo;

        public OfficeAddressService(IOfficeAddressRepository OfficeAddressRepo)
        {
            _OfficeAddressRepo = OfficeAddressRepo;
        }

        public IEnumerable<OfficeAddress> GetOfficeAddresses()
        {
            return _OfficeAddressRepo.GetOfficeAddresses();
        }

        public OfficeAddress GetOfficeAddressById(int id)
        {
            return _OfficeAddressRepo.GetOfficeAddressById(id);
        }

    }
}
