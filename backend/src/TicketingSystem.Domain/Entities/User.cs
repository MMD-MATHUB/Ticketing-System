namespace TicketingSystem.Domain.Entities
{
    using TicketingSystem.Domain.Enums;

    public class User
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required string PasswordHash { get; set; }
        public UserType UserType { get; set; } = UserType.Requester;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }
        public ICollection<UserApplicationAccess> ApplicationAccess { get; set; } = new List<UserApplicationAccess>();
    }
}
