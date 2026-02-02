namespace Omnas.Api.Models
{
    public class WearableDevice
    {
        public int Id { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string OSVersion { get; set; } = string.Empty;
        public DateTime LastSync { get; set; }
    }
}
