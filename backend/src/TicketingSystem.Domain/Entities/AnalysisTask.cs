namespace TicketingSystem.Domain.Entities;

public class AnalysisTask
{
    public int Id { get; set; }
    public string TaskNumber { get; set; } = string.Empty;
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TicketType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterEmail { get; set; } = string.Empty;
    public string SiteName { get; set; } = string.Empty;
    public string EquipmentNumber { get; set; } = string.Empty;
    public string Priority { get; set; } = string.Empty;
    public string PlantName { get; set; } = string.Empty;
    public string MaterialNumber { get; set; } = string.Empty;
    public string AssignedToUserId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
