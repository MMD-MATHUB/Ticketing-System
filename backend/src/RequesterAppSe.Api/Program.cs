using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using RequesterAppSe.Application.Interfaces;
using RequesterAppSe.Application.Services;
using RequesterAppSe.Infrastructure.Persistence;
using RequesterAppSe.Infrastructure.Repositories;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.WebHost.UseUrls("http://localhost:8080");

// JWT Configuration
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "your-super-secret-key-that-must-be-at-least-32-characters-long-12345678";
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "RequesterAppSe";
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "RequesterAppSeClients";

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret))
        };
    });

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequesterAccess", policy => policy.RequireClaim("application", "requester"));
    options.AddPolicy("ProcessingAccess", policy => policy.RequireClaim("application", "processing"));
    options.AddPolicy("AnalysisAccess", policy => policy.RequireClaim("application", "analysis"));
});

builder.Services.AddScoped<IJwtTokenService>(provider =>
    new JwtTokenService(jwtSecret, jwtIssuer, jwtAudience, 60));

builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<AuthService>();

builder.Services.AddControllers();
builder.Services.AddValidatorsFromAssemblyContaining<RequesterAppSe.Application.Validators.LoginRequestValidator>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:4200", "http://127.0.0.1:4200", "http://localhost:4201", "http://127.0.0.1:4201")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

if (!string.IsNullOrWhiteSpace(connectionString))
{
    builder.Services.AddDbContext<RequesterAppSeDbContext>(options =>
        options.UseNpgsql(connectionString));
}
else
{
    builder.Services.AddDbContext<RequesterAppSeDbContext>(options =>
        options.UseInMemoryDatabase("RequesterAppSeDb"));
}

builder.Services.AddScoped<ITicketRepository, TicketRepository>();
builder.Services.AddScoped<TicketService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<RequesterAppSeDbContext>();
    db.Database.EnsureCreated();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ReactPolicy");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/api/health", () => Results.Ok(new { status = "ok" }));

app.Run();
