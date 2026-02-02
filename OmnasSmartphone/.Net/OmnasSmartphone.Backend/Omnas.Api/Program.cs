using Microsoft.EntityFrameworkCore;
using Omnas.Api.Data;
using Omnas.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.


var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddDbContext<BackendDbContext>(options =>
    options.UseSqlServer(connectionString));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
// Add this line after builder.Services.AddDbContext...
builder.Services.AddScoped<IInventoryService, InventoryService>();

// 1. Add this before builder.Build()
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", policy => {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});


var app = builder.Build();

// 2. Add this before app.MapControllers()
app.UseCors("AllowAll");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
