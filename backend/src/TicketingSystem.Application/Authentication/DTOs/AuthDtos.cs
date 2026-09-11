namespace TicketingSystem.Application.DTOs
{
    public record ApplicationAccessDto(string Key, string Name, string Description);

    public class LoginRequest
    {
        public required string Email { get; set; }
        public required string Password { get; set; }
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public required string Message { get; set; }
        public string? Token { get; set; }
        public UserDto? User { get; set; }
        public List<ApplicationAccessDto> Applications { get; set; } = new();
    }

    public class UserDto
    {
        public required string Id { get; set; }
        public required string Email { get; set; }
        public required string Name { get; set; }
        public required string UserType { get; set; }
    }
}
