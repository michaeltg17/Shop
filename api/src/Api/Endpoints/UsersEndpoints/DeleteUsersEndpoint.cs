using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.UsersEndpoints;

public static class DeleteUsersEndpoint
{
    public static IEndpointRouteBuilder MapDeleteUsersEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/users", async ([FromBody] List<int> ids, [FromServices] AppDbContext context) =>
        {
            var users = await context.AdminUsers.Where(u => ids.Contains(u.Id)).ToListAsync();
            context.AdminUsers.RemoveRange(users);
            await context.SaveChangesAsync();
            return Results.NoContent();
        });

        return app;
    }
}
