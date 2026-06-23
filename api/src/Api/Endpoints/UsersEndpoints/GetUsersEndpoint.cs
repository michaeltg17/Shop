using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.UsersEndpoints;

public static class GetUsersEndpoint
{
    public static IEndpointRouteBuilder MapGetUsersEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/users", async ([FromServices] AppDbContext context) =>
            await context.AdminUsers.ToListAsync());

        return app;
    }
}
