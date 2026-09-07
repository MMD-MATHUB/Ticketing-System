namespace TicketingSystem.Application.Analysis;

public record AnalysisOverviewDto(
    int TotalTickets,
    int OpenTickets,
    int NotStartedTickets,
    int InProgressTickets,
    int ClosedTickets,
    List<AnalysisCountDto> ByPriority,
    List<AnalysisCountDto> ByPlant);

public record AnalysisCountDto(string Label, int Count);
