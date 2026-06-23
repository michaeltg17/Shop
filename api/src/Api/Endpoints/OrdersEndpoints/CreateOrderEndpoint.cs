using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Api.Endpoints.OrdersEndpoints;

public static class CreateOrderEndpoint
{
    public static IEndpointRouteBuilder MapCreateOrderEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/orders", async ([FromBody] OrderRequest orderRequest, [FromServices] AppDbContext context) =>
        {
            var total = orderRequest.Items.Sum(i => i.Price * i.Quantity);
            var order = new Order
            {
                Items = orderRequest.Items.Select(i => new OrderItem
                {
                    ProductId = i.ProductId,
                    ProductName = i.ProductName,
                    Price = i.Price,
                    Quantity = i.Quantity
                }).ToList(),
                Total = total,
                Shipping = orderRequest.Shipping,
                Status = "pending",
                CreatedAt = DateTime.UtcNow
            };

            context.Orders.Add(order);
            await context.SaveChangesAsync();
            return Results.Created($"/api/orders/{order.Id}", order);
        });

        return app;
    }
}
