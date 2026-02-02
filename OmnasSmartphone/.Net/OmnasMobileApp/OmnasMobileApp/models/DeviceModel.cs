namespace OmnasMobileApp.models
{
    public class SmartphoneDevice
    {
        public int Id { get; set; }

        // Use = string.Empty; to tell C# they start empty, not null
        public string DeviceName { get; set; } = string.Empty;
        public string OsVersion { get; set; } = string.Empty;
    }
}