using System.Net.Http.Json;

namespace OmnasMobileApp;

public partial class MainPage : ContentPage
{
    HttpClient client = new HttpClient();

    public MainPage()
    {
        InitializeComponent();
    }

    private async void OnRefreshClicked(object sender, EventArgs e)
    {
        // IMPORTANT: Use your PC's IP address here, not "localhost"
        // Because your phone is a different device than your PC!
        var devices = await client.GetFromJsonAsync<List<SmartphoneDevice>>("http://192.168.1.125:53047/api/SmartphoneDevices");
        DeviceList.ItemsSource = devices;
    }
}