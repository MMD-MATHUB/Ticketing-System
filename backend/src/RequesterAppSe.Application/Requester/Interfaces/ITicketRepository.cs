using RequesterAppSe.Domain.Entities;

namespace RequesterAppSe.Application.Interfaces;

public interface ITicketRepository
{
    Task<List<Ticket>> GetAllAsync();
    Task<Ticket?> GetByIdAsync(int id);
    Task<Ticket?> GetByTicketNumberAsync(string ticketNumber);
    Task<Ticket> AddAsync(Ticket ticket);
    Task UpdateAsync(Ticket ticket);
    Task<List<Plant>> GetPlantsAsync();
    Task<Plant?> GetPlantByCodeAsync(string code);
}
