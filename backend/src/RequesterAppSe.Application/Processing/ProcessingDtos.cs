using RequesterAppSe.Application.DTOs;

namespace RequesterAppSe.Application.Processing;

public record ProcessingQueueDto(
    int TotalOpen,
    int NotStarted,
    int InProgress,
    List<TicketDto> Tickets);
