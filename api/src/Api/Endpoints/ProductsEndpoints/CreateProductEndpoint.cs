using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Api.Endpoints.ProductsEndpoints;

public static class CreateProductEndpoint
{
    public static IEndpointRouteBuilder MapCreateProductEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/products", async (HttpContext ctx, [FromBody] Product product, [FromServices] AppDbContext context) =>
        {
            if (!ctx.User.Identity!.IsAuthenticated)
                return Results.Problem(
                    detail: "Authentication required",
                    title: "Unauthorized",
                    statusCode: StatusCodes.Status401Unauthorized,
                    type: "https://tools.ietf.org/html/rfc7235#section-3.1"
                );

            context.Products.Add(product);
            await context.SaveChangesAsync();
            return Results.Created($"/api/products/{product.Id}", product);
        });

        return app;
    }
}
