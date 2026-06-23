using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;

namespace Api.Endpoints.OrdersEndpoints;

public static class GetOrdersEndpoint
{
    public static IEndpointRouteBuilder MapGetOrdersEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/orders", async ([FromServices] AppDbContext context) =>
            await context.Orders
                .Include(o => o.Items)
                .OrderByDescending(o => o.CreatedAt)
                .ToListAsync());

        return app;
    }
}
