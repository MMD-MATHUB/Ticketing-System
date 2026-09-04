using RequesterAppSe.Domain.Enums;

namespace RequesterAppSe.Domain.Entities;

public class UserApplicationAccess
{
    public string UserId { get; set; } = string.Empty;
    public ApplicationArea Application { get; set; }
    public User? User { get; set; }
}