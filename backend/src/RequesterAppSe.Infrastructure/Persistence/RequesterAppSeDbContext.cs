using Microsoft.EntityFrameworkCore;
using RequesterAppSe.Domain.Entities;
using RequesterAppSe.Domain.Enums;

namespace RequesterAppSe.Infrastructure.Persistence;

public class RequesterAppSeDbContext : DbContext
{
    public RequesterAppSeDbContext(DbContextOptions<RequesterAppSeDbContext> options) : base(options)
    {
    }

    public DbSet<Plant> Plants => Set<Plant>();
    public DbSet<Ticket> Tickets => Set<Ticket>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserApplicationAccess> UserApplicationAccess => Set<UserApplicationAccess>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Plant>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Code).IsRequired();
            entity.Property(p => p.Name).IsRequired();
            entity.HasIndex(p => p.Code).IsUnique();
        });

        modelBuilder.Entity<Ticket>(entity =>
        {
            entity.HasKey(t => t.Id);
            entity.Property(t => t.TicketNumber).IsRequired();
            entity.HasIndex(t => t.TicketNumber).IsUnique();
            entity.Property(t => t.Title).IsRequired();
            entity.Property(t => t.Description).IsRequired();
            entity.HasOne(t => t.Plant)
                .WithMany()
                .HasForeignKey(t => t.PlantId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Email).IsRequired();
            entity.HasIndex(u => u.Email).IsUnique();
            entity.Property(u => u.Name).IsRequired();
            entity.Property(u => u.PasswordHash).IsRequired();
        });

        modelBuilder.Entity<UserApplicationAccess>(entity =>
        {
            entity.HasKey(access => new { access.UserId, access.Application });
            entity.HasOne(access => access.User)
                .WithMany(user => user.ApplicationAccess)
                .HasForeignKey(access => access.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        Seed(modelBuilder);
    }

    private static void Seed(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Plant>().HasData(
            new Plant { Id = 1, Code = "15S1", Name = "15S1 - Morocco 534T" },
            new Plant { Id = 2, Code = "20S1", Name = "20S1 - Germany Senvion" },
            new Plant { Id = 3, Code = "24S1", Name = "24S1 - Morocco 575V" },
            new Plant { Id = 4, Code = "26S1", Name = "26S1 - Mauritania 551W" }
        );

        // Hash password: "password123"
        var passwordHash = BCrypt.Net.BCrypt.HashPassword("password123");
        
        modelBuilder.Entity<User>().HasData(
            new User
            {
                Id = "1",
                Email = "demo@example.com",
                Name = "Demo User",
                PasswordHash = passwordHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "2",
                Email = "admin@example.com",
                Name = "Admin User",
                PasswordHash = passwordHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "3",
                Email = "processing@example.com",
                Name = "Processing User",
                PasswordHash = passwordHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = "4",
                Email = "analysis@example.com",
                Name = "Analysis User",
                PasswordHash = passwordHash,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            }
        );

        modelBuilder.Entity<UserApplicationAccess>().HasData(
            new UserApplicationAccess { UserId = "1", Application = ApplicationArea.Requester },
            new UserApplicationAccess { UserId = "2", Application = ApplicationArea.Requester },
            new UserApplicationAccess { UserId = "2", Application = ApplicationArea.Processing },
            new UserApplicationAccess { UserId = "2", Application = ApplicationArea.Analysis },
            new UserApplicationAccess { UserId = "3", Application = ApplicationArea.Processing },
            new UserApplicationAccess { UserId = "3", Application = ApplicationArea.Requester },
            new UserApplicationAccess { UserId = "4", Application = ApplicationArea.Analysis },
            new UserApplicationAccess { UserId = "4", Application = ApplicationArea.Processing }
        );

        modelBuilder.Entity<Ticket>().HasData(
            new Ticket
            {
                Id = 1,
                TicketNumber = "SMD-TKT-2409010001",
                Title = "Activation request for replacement controller",
                TicketType = "Activation",
                Description = "Replacement controller has been installed and needs activation for the site before handover.",
                RequesterName = "Diana Stratan",
                RequesterEmail = "diana.stratan@company.com",
                SiteName = "Site A",
                EquipmentNumber = "EQ-1001",
                Priority = Priority.High,
                Status = TicketStatus.InProgress,
                PlantId = 2,
                CreatedAt = DateTime.UtcNow.AddDays(-2),
                UpdatedAt = DateTime.UtcNow.AddDays(-2)
            },
            new Ticket
            {
                Id = 2,
                TicketNumber = "SMD-TKT-2409020002",
                Title = "Material request for pitch system inspection",
                TicketType = "Material request",
                Description = "Replacement inspection materials are needed for the upcoming maintenance window.",
                RequesterName = "Diana Stratan",
                RequesterEmail = "diana.stratan@company.com",
                SiteName = "Site B",
                EquipmentNumber = "EQ-2044",
                Priority = Priority.Medium,
                Status = TicketStatus.NotStarted,
                PlantId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-1),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Ticket
            {
                Id = 3,
                TicketNumber = "SMD-TKT-2408290003",
                Title = "Additional requester access required",
                TicketType = "Additional requester",
                Description = "Please add a second requester to the maintenance coordination workflow.",
                RequesterName = "Diana Stratan",
                RequesterEmail = "diana.stratan@company.com",
                SiteName = "Site C",
                EquipmentNumber = "EQ-3110",
                Priority = Priority.Low,
                Status = TicketStatus.Resolved,
                PlantId = 3,
                CreatedAt = DateTime.UtcNow.AddDays(-9),
                UpdatedAt = DateTime.UtcNow.AddDays(-6)
            },
            new Ticket
            {
                Id = 4,
                TicketNumber = "SMD-TKT-2408240004",
                Title = "Downgrade controller configuration",
                TicketType = "Downgrading",
                Description = "The controller configuration needs to be reviewed and downgraded for compatibility.",
                RequesterName = "Diana Stratan",
                RequesterEmail = "diana.stratan@company.com",
                SiteName = "Site D",
                EquipmentNumber = "EQ-4215",
                Priority = Priority.Critical,
                Status = TicketStatus.InProgress,
                PlantId = 4,
                CreatedAt = DateTime.UtcNow.AddDays(-6),
                UpdatedAt = DateTime.UtcNow.AddDays(-1)
            },
            new Ticket
            {
                Id = 5,
                TicketNumber = "SMD-TKT-2408100005",
                Title = "Activation completed for replacement unit",
                TicketType = "Activation",
                Description = "Replacement unit activation was completed after final validation.",
                RequesterName = "Diana Stratan",
                RequesterEmail = "diana.stratan@company.com",
                SiteName = "Site A",
                EquipmentNumber = "EQ-1088",
                Priority = Priority.High,
                Status = TicketStatus.Resolved,
                PlantId = 2,
                CreatedAt = DateTime.UtcNow.AddDays(-18),
                UpdatedAt = DateTime.UtcNow.AddDays(-15)
            },
            new Ticket
            {
                Id = 6,
                TicketNumber = "SMD-TKT-2408050006",
                Title = "Cancelled duplicate service request",
                TicketType = "Material request",
                Description = "This request was cancelled because the required material was already available on site.",
                RequesterName = "Diana Stratan",
                RequesterEmail = "diana.stratan@company.com",
                SiteName = "Site E",
                EquipmentNumber = "EQ-5020",
                Priority = Priority.Medium,
                Status = TicketStatus.Cancelled,
                PlantId = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-24),
                UpdatedAt = DateTime.UtcNow.AddDays(-23)
            },
            new Ticket { Id = 7, TicketNumber = "SMD-TKT-2408030007", Title = "Inspect yaw drive vibration", TicketType = "Activation", Description = "Inspection requested after abnormal vibration was reported.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site F", EquipmentNumber = "EQ-6071", Priority = Priority.High, Status = TicketStatus.InProgress, PlantId = 3, CreatedAt = DateTime.UtcNow.AddDays(-26), UpdatedAt = DateTime.UtcNow.AddDays(-2) },
            new Ticket { Id = 8, TicketNumber = "SMD-TKT-2408010008", Title = "Replace cabinet cooling fan", TicketType = "Material request", Description = "Replacement cooling fan required for the control cabinet.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site G", EquipmentNumber = "EQ-7033", Priority = Priority.Medium, Status = TicketStatus.NotStarted, PlantId = 2, CreatedAt = DateTime.UtcNow.AddDays(-28), UpdatedAt = DateTime.UtcNow.AddDays(-28) },
            new Ticket { Id = 9, TicketNumber = "SMD-TKT-2407280009", Title = "Update maintenance contact list", TicketType = "Additional requester", Description = "The local maintenance contact list needs an additional entry.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site H", EquipmentNumber = "EQ-8104", Priority = Priority.Low, Status = TicketStatus.Resolved, PlantId = 4, CreatedAt = DateTime.UtcNow.AddDays(-32), UpdatedAt = DateTime.UtcNow.AddDays(-29) },
            new Ticket { Id = 10, TicketNumber = "SMD-TKT-2407250010", Title = "Review pitch battery alarm", TicketType = "Activation", Description = "Please review the repeated pitch battery alarm at the site.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site I", EquipmentNumber = "EQ-9218", Priority = Priority.Critical, Status = TicketStatus.InProgress, PlantId = 1, CreatedAt = DateTime.UtcNow.AddDays(-35), UpdatedAt = DateTime.UtcNow.AddDays(-4) },
            new Ticket { Id = 11, TicketNumber = "SMD-TKT-2407190011", Title = "Request converter inspection kit", TicketType = "Material request", Description = "An inspection kit is needed for converter maintenance.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site J", EquipmentNumber = "EQ-1007", Priority = Priority.High, Status = TicketStatus.NotStarted, PlantId = 2, CreatedAt = DateTime.UtcNow.AddDays(-41), UpdatedAt = DateTime.UtcNow.AddDays(-41) },
            new Ticket { Id = 12, TicketNumber = "SMD-TKT-2407140012", Title = "Add regional support requester", TicketType = "Additional requester", Description = "Add regional support to the service request workflow.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site K", EquipmentNumber = "EQ-1140", Priority = Priority.Medium, Status = TicketStatus.Resolved, PlantId = 3, CreatedAt = DateTime.UtcNow.AddDays(-46), UpdatedAt = DateTime.UtcNow.AddDays(-42) },
            new Ticket { Id = 13, TicketNumber = "SMD-TKT-2407080013", Title = "Controller downgrade assessment", TicketType = "Downgrading", Description = "Assess compatibility before applying a controller downgrade.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site L", EquipmentNumber = "EQ-1202", Priority = Priority.Critical, Status = TicketStatus.NotStarted, PlantId = 4, CreatedAt = DateTime.UtcNow.AddDays(-52), UpdatedAt = DateTime.UtcNow.AddDays(-52) },
            new Ticket { Id = 14, TicketNumber = "SMD-TKT-2407010014", Title = "Replace hydraulic pressure sensor", TicketType = "Material request", Description = "A replacement pressure sensor is required before the next service visit.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site M", EquipmentNumber = "EQ-1309", Priority = Priority.High, Status = TicketStatus.Cancelled, PlantId = 1, CreatedAt = DateTime.UtcNow.AddDays(-59), UpdatedAt = DateTime.UtcNow.AddDays(-55) },
            new Ticket { Id = 15, TicketNumber = "SMD-TKT-2406250015", Title = "Activation documentation request", TicketType = "Activation", Description = "Provide activation documentation for the recently installed unit.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site N", EquipmentNumber = "EQ-1412", Priority = Priority.Low, Status = TicketStatus.Resolved, PlantId = 2, CreatedAt = DateTime.UtcNow.AddDays(-65), UpdatedAt = DateTime.UtcNow.AddDays(-61) },
            new Ticket { Id = 16, TicketNumber = "SMD-TKT-2406190016", Title = "Check turbine communication link", TicketType = "Activation", Description = "Communication checks are needed after intermittent connection loss.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site O", EquipmentNumber = "EQ-1505", Priority = Priority.Medium, Status = TicketStatus.InProgress, PlantId = 3, CreatedAt = DateTime.UtcNow.AddDays(-71), UpdatedAt = DateTime.UtcNow.AddDays(-7) },
            new Ticket { Id = 17, TicketNumber = "SMD-TKT-2406120017", Title = "Request spare nacelle filters", TicketType = "Material request", Description = "Spare filters requested for planned nacelle maintenance.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site P", EquipmentNumber = "EQ-1608", Priority = Priority.Medium, Status = TicketStatus.NotStarted, PlantId = 4, CreatedAt = DateTime.UtcNow.AddDays(-78), UpdatedAt = DateTime.UtcNow.AddDays(-78) },
            new Ticket { Id = 18, TicketNumber = "SMD-TKT-2406050018", Title = "Close completed service request", TicketType = "Additional requester", Description = "Confirm final documentation and close the completed service request.", RequesterName = "Diana Stratan", RequesterEmail = "diana.stratan@company.com", SiteName = "Site Q", EquipmentNumber = "EQ-1711", Priority = Priority.Low, Status = TicketStatus.Resolved, PlantId = 4, CreatedAt = DateTime.UtcNow.AddDays(-85), UpdatedAt = DateTime.UtcNow.AddDays(-80)
            }
        );
    }
}
