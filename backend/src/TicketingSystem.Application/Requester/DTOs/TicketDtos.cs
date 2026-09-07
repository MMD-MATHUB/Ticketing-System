namespace TicketingSystem.Application.DTOs;

public record TicketDto(
    int Id,
    string TicketNumber,
    string Title,
    string TicketType,
    string Description,
    string RequesterName,
    string RequesterEmail,
    string SiteName,
    string EquipmentNumber,
    string Priority,
    string Status,
    string PlantName,
    DateTime CreatedAt,
    DateTime UpdatedAt);

public record PlantDto(int Id, string Code, string Name);

public record CreateTicketRequest(
    string Title,
    string TicketType,
    string Description,
    string RequesterName,
    string RequesterEmail,
    string SiteName,
    string EquipmentNumber,
    string Priority,
    string PlantCode,
    string Status = "NotStarted");

public record AddCommentRequest(string Role, string Message);

public record DashboardStatsDto(
    int Total,
    int NotStarted,
    int InProgress,
    int Closed,
    int PendingReply,
    int NewThisWeek,
    int OldestPendingDays,
    int InProgressPercent,
    int AvgDaysToClose);

public record DashboardResponseDto(
    DashboardStatsDto Stats,
    List<TicketDto> RecentTickets,
    List<CountByLabelDto> OpenByPriority,
    List<CountByLabelDto> OpenByPlant,
    List<TicketDto> PendingTickets);

public record CountByLabelDto(string Label, int Count);
