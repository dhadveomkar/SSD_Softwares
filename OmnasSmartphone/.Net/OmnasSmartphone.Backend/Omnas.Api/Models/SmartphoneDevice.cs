namespace Omnas.Api.Models
{
    public class SmartphoneDevice
    {
        public int Id { get; set; }
        public string DeviceName { get; set; } = string.Empty;
        public string OSVersion { get; set; } = string.Empty;
        public DateTime LastSync { get; set; }

        public int Id { get; set; }

    }
}
