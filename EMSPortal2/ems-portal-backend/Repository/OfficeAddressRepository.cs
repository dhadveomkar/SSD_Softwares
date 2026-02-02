using POCEmployeePortal.Models;
using POCEmployeePortal.Repository.Interface;

namespace POCEmployeePortal.Repository
{
    public class OfficeAddressRepository : IOfficeAddressRepository
    {
        private readonly POCEmployeePortalContext db;

        public OfficeAddressRepository(POCEmployeePortalContext db)
        {
            this.db = db;
        }

        public IEnumerable<OfficeAddress> GetOfficeAddresses()
        {
            var result = from OfficeAddress in db.OfficeAddresses
                         select OfficeAddress;
            return result;
        }

        public OfficeAddress GetOfficeAddressById(int id)
        {
            var result = (from OfficeAddress in db.OfficeAddresses
                          where OfficeAddress.AddressId == id
                          select OfficeAddress).FirstOrDefault();
            return result;
        }
    }
}
