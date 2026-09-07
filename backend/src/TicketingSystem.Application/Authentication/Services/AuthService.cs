using TicketingSystem.Application.DTOs;
using TicketingSystem.Application.Interfaces;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Application.Services;

public class AuthService
{
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IUserRepository _userRepository;

    public AuthService(
        IJwtTokenService jwtTokenService,
        IPasswordHasher passwordHasher,
        IUserRepository userRepository)
    {
        _jwtTokenService = jwtTokenService;
        _passwordHasher = passwordHasher;
        _userRepository = userRepository;
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);

        if (user is null || !_passwordHasher.VerifyPassword(request.Password, user.PasswordHash) || !user.IsActive)
        {
            return null;
        }

        var applications = await _userRepository.GetApplicationsAsync(user.Id);
        var token = _jwtTokenService.GenerateToken(user.Id, user.Email, user.Name, applications);
        user.LastLoginAt = DateTime.UtcNow;
        await _userRepository.UpdateAsync(user);

        return new AuthResponse
        {
            Success = true,
            Message = "Login successful",
            Token = token,
            User = new UserDto
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.Name
            },
            Applications = applications.Select(ToApplicationDto).ToList()
        };
    }

    private static ApplicationAccessDto ToApplicationDto(ApplicationArea application)
    {
        return application switch
        {
            ApplicationArea.Requester => new("requester", "Requester", "Submit and follow up on service tickets."),
            ApplicationArea.Processing => new("processing", "Processing", "Review, assign, and process incoming tickets."),
            ApplicationArea.Analysis => new("analysis", "Analysis", "Explore ticket trends and operational insights."),
            _ => throw new ArgumentOutOfRangeException(nameof(application))
        };
    }
}