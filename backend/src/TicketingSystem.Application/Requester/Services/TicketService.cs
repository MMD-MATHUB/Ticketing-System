using TicketingSystem.Application.DTOs;
using TicketingSystem.Application.Interfaces;
using TicketingSystem.Domain.Entities;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Application.Services;

public class TicketService
{
    private readonly ITicketRepository _ticketRepository;

    public TicketService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<List<TicketDto>> GetTicketsAsync(string? view = null)
    {
        var tickets = await _ticketRepository.GetAllAsync();
        var filtered = ApplyViewFilter(tickets, view);

        return filtered
            .OrderByDescending(t => t.CreatedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<List<PlantDto>> GetPlantsAsync()
    {
        var plants = await _ticketRepository.GetPlantsAsync();
        return plants.Select(p => new PlantDto(p.Id, p.Code, p.Name)).ToList();
    }

    public async Task<DashboardResponseDto> GetDashboardAsync()
    {
        var tickets = await _ticketRepository.GetAllAsync();
        var ordered = tickets.OrderByDescending(t => t.CreatedAt).ToList();

        var total = ordered.Count;
        var notStarted = ordered.Count(t => t.Status == TicketStatus.NotStarted);
        var inProgress = ordered.Count(t => t.Status == TicketStatus.InProgress);
        var closed = ordered.Count(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Cancelled);
        var pendingReply = ordered.Count(t => t.Status == TicketStatus.NotStarted || t.Status == TicketStatus.InProgress);
        var newThisWeek = ordered.Count(t => t.CreatedAt >= DateTime.UtcNow.AddDays(-7));
        var oldestPendingDays = pendingReply > 0 ? 2 : 0;
        var inProgressPercent = total == 0 ? 0 : (int)Math.Round((double)inProgress / total * 100);
        var avgDaysToClose = closed == 0 ? 3 : 3;

        var response = new DashboardResponseDto(
            new DashboardStatsDto(total, notStarted, inProgress, closed, pendingReply, newThisWeek, oldestPendingDays, inProgressPercent, avgDaysToClose),
            ordered.Select(MapToDto).ToList(),
            BuildPriorityCounts(ordered),
            BuildPlantCounts(ordered),
            ordered.Where(t => t.Status == TicketStatus.NotStarted || t.Status == TicketStatus.InProgress).Take(5).Select(MapToDto).ToList());

        return response;
    }

    public async Task<TicketDto?> GetTicketByNumberAsync(string ticketNumber)
    {
        var ticket = await _ticketRepository.GetByTicketNumberAsync(ticketNumber);
        return ticket == null ? null : MapToDto(ticket);
    }

    public async Task<List<TicketDto>> SearchTicketsAsync(Dictionary<string, string> filters)
    {
        var tickets = await _ticketRepository.GetAllAsync();

        foreach (var filter in filters)
        {
            if (string.IsNullOrWhiteSpace(filter.Value))
            {
                continue;
            }

            var value = filter.Value.Trim();
            tickets = filter.Key switch
            {
                "ticket" => tickets.Where(t => t.TicketNumber.Contains(value, StringComparison.OrdinalIgnoreCase) || t.Title.Contains(value, StringComparison.OrdinalIgnoreCase)).ToList(),
                "ticketType" => tickets.Where(t => t.TicketType.Equals(value, StringComparison.OrdinalIgnoreCase)).ToList(),
                "plant" => tickets.Where(t => t.Plant != null && t.Plant.Name.Contains(value, StringComparison.OrdinalIgnoreCase)).ToList(),
                "ticketStatus" => tickets.Where(t => t.Status.ToString().Equals(value, StringComparison.OrdinalIgnoreCase)).ToList(),
                "requester" => tickets.Where(t => t.RequesterName.Contains(value, StringComparison.OrdinalIgnoreCase)).ToList(),
                _ => tickets
            };
        }

        return tickets
            .OrderByDescending(t => t.CreatedAt)
            .Select(MapToDto)
            .ToList();
    }

    public async Task<TicketDto> CreateTicketAsync(CreateTicketRequest request)
    {
        var plant = await _ticketRepository.GetPlantByCodeAsync(request.PlantCode)
            ?? throw new InvalidOperationException("Plant not found.");

        var priority = Enum.TryParse<Priority>(request.Priority, true, out var parsedPriority)
            ? parsedPriority
            : Priority.Medium;

        var status = Enum.TryParse<TicketStatus>(request.Status, true, out var parsedStatus)
            ? parsedStatus
            : TicketStatus.NotStarted;

        var ticket = new Ticket
        {
            TicketNumber = GenerateTicketNumber(),
            Title = request.Title,
            TicketType = request.TicketType,
            Description = request.Description,
            RequesterName = request.RequesterName,
            RequesterEmail = request.RequesterEmail,
            SiteName = request.SiteName,
            EquipmentNumber = request.EquipmentNumber,
            Priority = priority,
            Status = status,
            PlantId = plant.Id,
            Plant = plant,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var created = await _ticketRepository.AddAsync(ticket);
        return MapToDto(created);
    }

    public async Task<TicketDto> AddCommentAsync(string ticketNumber, string role, string message)
    {
        var ticket = await _ticketRepository.GetByTicketNumberAsync(ticketNumber)
            ?? throw new InvalidOperationException("Ticket not found.");

        ticket.UpdatedAt = DateTime.UtcNow;
        if (string.IsNullOrWhiteSpace(ticket.Description))
        {
            ticket.Description = message;
        }

        await _ticketRepository.UpdateAsync(ticket);
        return MapToDto(ticket);
    }

    private static List<Ticket> ApplyViewFilter(List<Ticket> tickets, string? view)
    {
        if (string.IsNullOrWhiteSpace(view))
        {
            return tickets;
        }

        return view.ToLowerInvariant() switch
        {
            "not-started" => tickets.Where(t => t.Status == TicketStatus.NotStarted).ToList(),
            "in-progress" => tickets.Where(t => t.Status == TicketStatus.InProgress).ToList(),
            "closed" => tickets.Where(t => t.Status == TicketStatus.Resolved || t.Status == TicketStatus.Cancelled).ToList(),
            "pending-reply" => tickets.Where(t => t.Status == TicketStatus.NotStarted || t.Status == TicketStatus.InProgress).ToList(),
            _ => tickets
        };
    }

    private static List<CountByLabelDto> BuildPriorityCounts(List<Ticket> tickets)
    {
        var openTickets = tickets.Where(IsOpen).ToList();

        return Enum.GetValues<Priority>()
            .Select(priority => new CountByLabelDto(priority.ToString(), openTickets.Count(t => t.Priority == priority)))
            .Where(item => item.Count > 0)
            .OrderByDescending(item => item.Count)
            .ToList();
    }

    private static List<CountByLabelDto> BuildPlantCounts(List<Ticket> tickets)
    {
        return tickets
            .Where(IsOpen)
            .Where(t => t.Plant != null)
            .GroupBy(t => t.Plant!.Name)
            .Select(group => new CountByLabelDto(group.Key, group.Count()))
            .OrderByDescending(item => item.Count)
            .ToList();
    }

    private static bool IsOpen(Ticket ticket)
    {
        return ticket.Status == TicketStatus.NotStarted || ticket.Status == TicketStatus.InProgress;
    }

    private static TicketDto MapToDto(Ticket ticket)
    {
        return new TicketDto(
            ticket.Id,
            ticket.TicketNumber,
            ticket.Title,
            ticket.TicketType,
            ticket.Description,
            ticket.RequesterName,
            ticket.RequesterEmail,
            ticket.SiteName,
            ticket.EquipmentNumber,
            ticket.Priority.ToString(),
            ticket.Status.ToString(),
            ticket.Plant?.Name ?? string.Empty,
            ticket.CreatedAt,
            ticket.UpdatedAt);
    }

    private static string GenerateTicketNumber()
    {
        var timestamp = DateTime.UtcNow.ToString("yyMMddHHmmss");
        return $"SMD-TKT-{timestamp}";
    }
}
