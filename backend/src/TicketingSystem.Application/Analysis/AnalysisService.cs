using TicketingSystem.Application.Interfaces;
using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Application.Analysis;

public class AnalysisService
{
    private readonly ITicketRepository _ticketRepository;

    public AnalysisService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<AnalysisOverviewDto> GetOverviewAsync()
    {
        var tickets = await _ticketRepository.GetAllAsync();
        var openTickets = tickets.Where(ticket => ticket.Status is TicketStatus.NotStarted or TicketStatus.InProgress).ToList();

        return new AnalysisOverviewDto(
            tickets.Count,
            openTickets.Count,
            tickets.Count(ticket => ticket.Status == TicketStatus.NotStarted),
            tickets.Count(ticket => ticket.Status == TicketStatus.InProgress),
            tickets.Count(ticket => ticket.Status is TicketStatus.Resolved or TicketStatus.Cancelled),
            Enum.GetValues<Priority>()
                .Select(priority => new AnalysisCountDto(priority.ToString(), tickets.Count(ticket => ticket.Priority == priority)))
                .Where(item => item.Count > 0)
                .ToList(),
            openTickets
                .Where(ticket => ticket.Plant is not null)
                .GroupBy(ticket => ticket.Plant!.Name)
                .Select(group => new AnalysisCountDto(group.Key, group.Count()))
                .OrderByDescending(item => item.Count)
                .ToList());
    }
}
