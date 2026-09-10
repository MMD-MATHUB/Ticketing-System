using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using FluentValidation;
using RequesterAppSe.Application.Interfaces;
using RequesterAppSe.Application.Analysis;
using RequesterAppSe.Application.Processing;
using RequesterAppSe.Application.Services;
using RequesterAppSe.Infrastructure.Persistence;
using RequesterAppSe.Infrastructure.Repositories;
using RequesterAppSe.Api.LiveUpdates;
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
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                if (!string.IsNullOrEmpty(accessToken) && context.HttpContext.Request.Path.StartsWithSegments("/api/events"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
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
builder.Services.AddScoped<ProcessingService>();
builder.Services.AddScoped<AnalysisService>();
builder.Services.AddSingleton<TicketUpdateBroadcaster>();

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
app.MapGet("/api/events", async (HttpContext context, TicketUpdateBroadcaster broadcaster) =>
{
    context.Response.ContentType = "text/event-stream";
    context.Response.Headers.CacheControl = "no-cache";
    context.Response.Headers.Connection = "keep-alive";

    var subscription = broadcaster.Subscribe();
    try
    {
        await foreach (var eventName in subscription.Reader.ReadAllAsync(context.RequestAborted))
        {
            await context.Response.WriteAsync($"event: {eventName}\ndata: {{}}\n\n", context.RequestAborted);
            await context.Response.Body.FlushAsync(context.RequestAborted);
        }
    }
    catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
    {
    }
    finally
    {
        broadcaster.Unsubscribe(subscription.Id);
    }
}).RequireAuthorization();

app.Run();
