using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Api.Endpoints.UsersEndpoints;

public static class CreateUserEndpoint
{
    public static IEndpointRouteBuilder MapCreateUserEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/users", async ([FromBody] AdminUser user, [FromServices] AppDbContext context) =>
        {
            context.AdminUsers.Add(user);
            await context.SaveChangesAsync();
            return Results.Created($"/api/users/{user.Id}", user);
        });

        return app;
    }
}
