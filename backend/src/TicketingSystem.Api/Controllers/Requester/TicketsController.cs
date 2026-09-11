using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using FluentValidation;
using TicketingSystem.Application.DTOs;
using TicketingSystem.Application.Services;
using TicketingSystem.Api.LiveUpdates;

namespace TicketingSystem.Api.Controllers.Requester;

[ApiController]
[Authorize(Policy = "TicketReadAccess")]
[Route("api/[controller]")]
public class TicketsController : ControllerBase
{
    private readonly TicketService _ticketService;
    private readonly IValidator<CreateTicketRequest> _createTicketValidator;
    private readonly IValidator<AddCommentRequest> _commentValidator;
    private readonly TicketUpdateBroadcaster _ticketUpdateBroadcaster;

    public TicketsController(
        TicketService ticketService,
        IValidator<CreateTicketRequest> createTicketValidator,
        IValidator<AddCommentRequest> commentValidator,
        TicketUpdateBroadcaster ticketUpdateBroadcaster)
    {
        _ticketService = ticketService;
        _createTicketValidator = createTicketValidator;
        _commentValidator = commentValidator;
        _ticketUpdateBroadcaster = ticketUpdateBroadcaster;
    }

    [HttpGet]
    public async Task<ActionResult<List<TicketDto>>> GetTickets([FromQuery] string? view = null)
    {
        return Ok(await _ticketService.GetTicketsAsync(view));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardResponseDto>> GetDashboard()
    {
        return Ok(await _ticketService.GetDashboardAsync());
    }

    [HttpGet("plants")]
    public async Task<ActionResult<List<PlantDto>>> GetPlants()
    {
        return Ok(await _ticketService.GetPlantsAsync());
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<TicketDto>>> SearchTickets(
        [FromQuery] string? ticket,
        [FromQuery] string? ticketType,
        [FromQuery] string? plant,
        [FromQuery] string? ticketStatus,
        [FromQuery] string? requester)
    {
        var filters = new Dictionary<string, string>();

        if (!string.IsNullOrWhiteSpace(ticket)) filters["ticket"] = ticket;
        if (!string.IsNullOrWhiteSpace(ticketType)) filters["ticketType"] = ticketType;
        if (!string.IsNullOrWhiteSpace(plant)) filters["plant"] = plant;
        if (!string.IsNullOrWhiteSpace(ticketStatus)) filters["ticketStatus"] = ticketStatus;
        if (!string.IsNullOrWhiteSpace(requester)) filters["requester"] = requester;

        return Ok(await _ticketService.SearchTicketsAsync(filters));
    }

    [HttpGet("{ticketNumber}")]
    public async Task<ActionResult<TicketDto>> GetTicket(string ticketNumber)
    {
        var ticket = await _ticketService.GetTicketByNumberAsync(ticketNumber);
        if (ticket is null)
        {
            return NotFound();
        }

        return Ok(ticket);
    }

    [HttpPost]
    [Authorize(Policy = "RequesterAccess")]
    public async Task<ActionResult<TicketDto>> CreateTicket([FromBody] CreateTicketRequest request)
    {
        var validation = await _createTicketValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return BadRequest(validation.Errors);
        }

        try
        {
            var ticket = await _ticketService.CreateTicketAsync(request);
            _ticketUpdateBroadcaster.Publish("tickets-changed");
            return CreatedAtAction(nameof(GetTicket), new { ticketNumber = ticket.TicketNumber }, ticket);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("{ticketNumber}/comments")]
    [Authorize(Policy = "RequesterAccess")]
    public async Task<ActionResult<TicketDto>> AddComment(string ticketNumber, [FromBody] AddCommentRequest request)
    {
        var validation = await _commentValidator.ValidateAsync(request);
        if (!validation.IsValid)
        {
            return BadRequest(validation.Errors);
        }

        try
        {
            var ticket = await _ticketService.AddCommentAsync(ticketNumber, request.Role, request.Message);
            _ticketUpdateBroadcaster.Publish("tickets-changed");
            return Ok(ticket);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
