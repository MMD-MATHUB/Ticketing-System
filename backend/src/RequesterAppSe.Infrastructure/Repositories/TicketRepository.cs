using Microsoft.EntityFrameworkCore;
using RequesterAppSe.Application.Interfaces;
using RequesterAppSe.Domain.Entities;
using RequesterAppSe.Infrastructure.Persistence;

namespace RequesterAppSe.Infrastructure.Repositories;

public class TicketRepository : ITicketRepository
{
    private readonly RequesterAppSeDbContext _context;

    public TicketRepository(RequesterAppSeDbContext context)
    {
        _context = context;
    }

    public async Task<List<Ticket>> GetAllAsync()
    {
        return await _context.Tickets
            .Include(t => t.Plant)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<Ticket?> GetByIdAsync(int id)
    {
        return await _context.Tickets
            .Include(t => t.Plant)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<Ticket?> GetByTicketNumberAsync(string ticketNumber)
    {
        return await _context.Tickets
            .Include(t => t.Plant)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.TicketNumber == ticketNumber);
    }

    public async Task<Ticket> AddAsync(Ticket ticket)
    {
        _context.Tickets.Add(ticket);
        await _context.SaveChangesAsync();
        return ticket;
    }

    public async Task UpdateAsync(Ticket ticket)
    {
        _context.Tickets.Update(ticket);
        await _context.SaveChangesAsync();
    }

    public async Task<List<Plant>> GetPlantsAsync()
    {
        return await _context.Plants.OrderBy(p => p.Name).ToListAsync();
    }

    public async Task<Plant?> GetPlantByCodeAsync(string code)
    {
        return await _context.Plants.FirstOrDefaultAsync(p => p.Code == code);
    }
}
