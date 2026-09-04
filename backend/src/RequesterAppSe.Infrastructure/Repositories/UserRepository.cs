using Microsoft.EntityFrameworkCore;
using RequesterAppSe.Application.Interfaces;
using RequesterAppSe.Domain.Entities;
using RequesterAppSe.Domain.Enums;
using RequesterAppSe.Infrastructure.Persistence;

namespace RequesterAppSe.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly RequesterAppSeDbContext _context;

        public UserRepository(RequesterAppSeDbContext context)
        {
            _context = context;
        }

        public async Task<User?> GetByEmailAsync(string email)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        }

        public async Task<User?> GetByIdAsync(string id)
        {
            return await _context.Users.FirstOrDefaultAsync(u => u.Id == id);
        }

        public async Task AddAsync(User user)
        {
            await _context.Users.AddAsync(user);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            _context.Users.Update(user);
            await _context.SaveChangesAsync();
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<List<ApplicationArea>> GetApplicationsAsync(string userId)
        {
            return await _context.UserApplicationAccess
                .Where(access => access.UserId == userId)
                .Select(access => access.Application)
                .OrderBy(application => application)
                .ToListAsync();
        }
    }
}
