using TicketingSystem.Application.DTOs;

namespace TicketingSystem.Application.Processing;

public record ProcessingQueueDto(
    int TotalOpen,
    int NotStarted,
    int InProgress,
    List<TicketDto> Tickets);
