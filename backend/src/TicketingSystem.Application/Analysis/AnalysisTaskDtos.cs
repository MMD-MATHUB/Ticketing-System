namespace TicketingSystem.Application.Analysis;

public record AssignTicketsRequest(List<string> TicketNumbers);

public record AnalysisTaskDto(
    string TaskNumber,
    string TicketNumber,
    string PlantName,
    string MaterialNumber,
    string Title,
    string TicketType,
    string Description,
    string RequesterName,
    string RequesterEmail,
    string SiteName,
    string EquipmentNumber,
    string Priority,
    string AssignedToUserId,
    DateTime CreatedAt);
