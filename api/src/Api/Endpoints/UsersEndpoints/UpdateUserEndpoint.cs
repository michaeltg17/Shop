using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Api.Endpoints.UsersEndpoints;

public static class UpdateUserEndpoint
{
    public static IEndpointRouteBuilder MapUpdateUserEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/users/{id}", async (int id, [FromBody] AdminUser user, [FromServices] AppDbContext context) =>
        {
            var existing = await context.AdminUsers.FindAsync(id);
            if (existing == null)
                return Results.Problem(
                    detail: $"User with id {id} not found",
                    title: "Not Found",
                    statusCode: StatusCodes.Status404NotFound,
                    type: "https://tools.ietf.org/html/rfc7231#section-6.5.4"
                );

            existing.FirstName = user.FirstName;
            existing.LastName = user.LastName;
            existing.Email = user.Email;
            existing.PhoneNumber = user.PhoneNumber;
            existing.IsActive = user.IsActive;
            await context.SaveChangesAsync();

            return Results.Ok(existing);
        });

        return app;
    }
}
