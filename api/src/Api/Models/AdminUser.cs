namespace Api.Models;

public record AdminUser(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    bool IsActive
);
