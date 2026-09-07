using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FluentValidation;
using TicketingSystem.Application.DTOs;
using TicketingSystem.Application.Services;

namespace TicketingSystem.Api.Controllers.Authentication
{
    [ApiController]
    [AllowAnonymous]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly IValidator<LoginRequest> _validator;

        public AuthController(AuthService authService, IValidator<LoginRequest> validator)
        {
            _authService = authService;
            _validator = validator;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var validation = await _validator.ValidateAsync(request);
            if (!validation.IsValid)
            {
                return BadRequest(validation.Errors);
            }

            var response = await _authService.LoginAsync(request);
            if (response is null)
            {
                return Unauthorized(new AuthResponse
                {
                    Success = false,
                    Message = "Invalid email or password"
                });
            }

            return Ok(response);
        }
    }
}
