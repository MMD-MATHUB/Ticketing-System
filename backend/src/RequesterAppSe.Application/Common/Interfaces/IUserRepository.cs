using RequesterAppSe.Domain.Entities;
using RequesterAppSe.Domain.Enums;

namespace RequesterAppSe.Application.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(string id);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task<bool> EmailExistsAsync(string email);
        Task<List<ApplicationArea>> GetApplicationsAsync(string userId);
    }
}
