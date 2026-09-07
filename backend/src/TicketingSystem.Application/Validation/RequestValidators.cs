using FluentValidation;
using TicketingSystem.Application.DTOs;

namespace TicketingSystem.Application.Validators;

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(request => request.Email).NotEmpty().EmailAddress();
        RuleFor(request => request.Password).NotEmpty().MinimumLength(8);
    }
}

public class CreateTicketRequestValidator : AbstractValidator<CreateTicketRequest>
{
    public CreateTicketRequestValidator()
    {
        RuleFor(request => request.Title).NotEmpty().MaximumLength(200);
        RuleFor(request => request.TicketType).NotEmpty().MaximumLength(100);
        RuleFor(request => request.Description).NotEmpty().MaximumLength(5000);
        RuleFor(request => request.RequesterName).NotEmpty().MaximumLength(200);
        RuleFor(request => request.RequesterEmail).NotEmpty().EmailAddress();
        RuleFor(request => request.PlantCode).NotEmpty().MaximumLength(20);
        RuleFor(request => request.Priority).Must(priority => Enum.TryParse<Domain.Enums.Priority>(priority, true, out _))
            .WithMessage("Priority is invalid.");
    }
}

public class AddCommentRequestValidator : AbstractValidator<AddCommentRequest>
{
    public AddCommentRequestValidator()
    {
        RuleFor(request => request.Role).NotEmpty().MaximumLength(50);
        RuleFor(request => request.Message).NotEmpty().MaximumLength(5000);
    }
}