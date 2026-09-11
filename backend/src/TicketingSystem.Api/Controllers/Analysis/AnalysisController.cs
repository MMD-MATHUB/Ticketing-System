using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketingSystem.Application.Analysis;
using TicketingSystem.Infrastructure.Persistence;
using TicketingSystem.Domain.Entities;
using TicketingSystem.Domain.Enums;
using TicketingSystem.Api.LiveUpdates;
using System.Text.RegularExpressions;
using Microsoft.EntityFrameworkCore;

namespace TicketingSystem.Api.Controllers.Analysis;

[ApiController]
[Authorize(Policy = "AnalysisAccess")]
[Route("api/analysis")]
public class AnalysisController : ControllerBase
{
    private readonly AnalysisService _analysisService;
    private readonly TicketingSystemDbContext _db;
    private readonly TicketUpdateBroadcaster _broadcaster;

    public AnalysisController(AnalysisService analysisService, TicketingSystemDbContext db, TicketUpdateBroadcaster broadcaster)
    {
        _analysisService = analysisService;
        _db = db;
        _broadcaster = broadcaster;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AnalysisOverviewDto>> GetOverview()
    {
        return Ok(await _analysisService.GetOverviewAsync());
    }

    [HttpGet("tasks")]
    public async Task<ActionResult<List<AnalysisTaskDto>>> GetTasks()
    {
        var tasks = await _db.AnalysisTasks.OrderByDescending(task => task.CreatedAt).ToListAsync();
        return Ok(tasks.Select(task => new AnalysisTaskDto(task.TaskNumber, task.TicketNumber, task.PlantName, task.MaterialNumber, task.Title, task.TicketType, task.Description, task.RequesterName, task.RequesterEmail, task.SiteName, task.EquipmentNumber, task.Priority, task.AssignedToUserId, task.CreatedAt)).ToList());
    }

    [HttpPost("assign")]
    public async Task<ActionResult<List<AnalysisTaskDto>>> AssignTickets([FromBody] AssignTicketsRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? string.Empty;
        var ticketNumbers = request.TicketNumbers.Distinct().ToList();
        var tickets = await _db.Tickets.Include(ticket => ticket.Plant).Where(ticket => ticketNumbers.Contains(ticket.TicketNumber)).ToListAsync();
        var existing = await _db.AnalysisTasks.Where(task => ticketNumbers.Contains(task.TicketNumber)).ToListAsync();
        var createdTasks = new List<AnalysisTask>();

        foreach (var ticket in tickets)
        {
            ticket.Status = TicketStatus.InProgress;
            ticket.UpdatedAt = DateTime.UtcNow;
            var materials = Regex.Matches(ticket.Description ?? string.Empty, "[A-Z0-9-]{6,}")
                .Select(match => match.Value)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList();
            if (materials.Count == 0) materials.Add("General analysis");

            foreach (var material in materials)
            {
                var plantName = ticket.Plant?.Name ?? string.Empty;
                if (existing.Any(task => task.TicketNumber == ticket.TicketNumber && task.PlantName == plantName && task.MaterialNumber.Equals(material, StringComparison.OrdinalIgnoreCase))) continue;

                createdTasks.Add(new AnalysisTask
                {
                    TaskNumber = $"SMD-TSK-{DateTime.UtcNow:yyMMddHHmmssfff}-{Guid.NewGuid():N}"[..27],
                    TicketNumber = ticket.TicketNumber,
                    Title = ticket.Title,
                    TicketType = ticket.TicketType,
                    Description = ticket.Description,
                    RequesterName = ticket.RequesterName,
                    RequesterEmail = ticket.RequesterEmail,
                    SiteName = ticket.SiteName,
                    EquipmentNumber = ticket.EquipmentNumber,
                    Priority = ticket.Priority.ToString(),
                    PlantName = plantName,
                    MaterialNumber = material,
                    AssignedToUserId = userId,
                });
            }
        }

        _db.AnalysisTasks.AddRange(createdTasks);
        await _db.SaveChangesAsync();
        _broadcaster.Publish("tickets-changed");
        return Ok(createdTasks.Select(task => new AnalysisTaskDto(task.TaskNumber, task.TicketNumber, task.PlantName, task.MaterialNumber, task.Title, task.TicketType, task.Description, task.RequesterName, task.RequesterEmail, task.SiteName, task.EquipmentNumber, task.Priority, task.AssignedToUserId, task.CreatedAt)).ToList());
    }
}
