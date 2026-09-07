using RequesterAppSe.Application.DTOs;
using RequesterAppSe.Application.Interfaces;
using RequesterAppSe.Domain.Entities;
using RequesterAppSe.Domain.Enums;

namespace RequesterAppSe.Application.Processing;

public class ProcessingService
{
    private readonly ITicketRepository _ticketRepository;

    public ProcessingService(ITicketRepository ticketRepository)
    {
        _ticketRepository = ticketRepository;
    }

    public async Task<ProcessingQueueDto> GetQueueAsync()
    {
        var tickets = await _ticketRepository.GetAllAsync();
        var openTickets = tickets
            .Where(ticket => ticket.Status is TicketStatus.NotStarted or TicketStatus.InProgress)
            .OrderByDescending(ticket => ticket.UpdatedAt)
            .ToList();

        return new ProcessingQueueDto(
            openTickets.Count,
            openTickets.Count(ticket => ticket.Status == TicketStatus.NotStarted),
            openTickets.Count(ticket => ticket.Status == TicketStatus.InProgress),
            openTickets.Select(MapToDto).ToList());
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
}
