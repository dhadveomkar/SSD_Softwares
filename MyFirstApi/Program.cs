var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddScalarApiReference();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseHttpsRedirection();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

// 2. Create the POST endpoint
app.MapPost("/order", (ProductOrder order) => 
{
    // In a real app, you would save this to a database here
    return Results.Ok($"Order received for {order.Quantity} units of {order.ProductName}!");
});

// The {name} in the string acts as a variable placeholder
app.MapGet("/hello1/{name}", (string name) => $"Welcome to my backend, {name}!");

// 1. Add your new custom route here
app.MapGet("/hello", () => "Welcome to my first .NET Backend!");

app.MapGet("/weatherforecast", () =>
{
    var forecast =  Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

// 1. Define what the data looks like
record ProductOrder(string ProductName, int Quantity);
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
