using TicketingSystem.Domain.Enums;

namespace TicketingSystem.Domain.Entities;

public class Ticket
{
    public int Id { get; set; }
    public string TicketNumber { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string TicketType { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterEmail { get; set; } = string.Empty;
    public string SiteName { get; set; } = string.Empty;
    public string EquipmentNumber { get; set; } = string.Empty;
    public Priority Priority { get; set; } = Priority.Medium;
    public TicketStatus Status { get; set; } = TicketStatus.NotStarted;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public int PlantId { get; set; }
    public Plant? Plant { get; set; }
    public List<TicketComment> Comments { get; set; } = new();
}
