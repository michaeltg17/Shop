using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Api.Endpoints.ProductsEndpoints;

public static class UpdateProductEndpoint
{
    public static IEndpointRouteBuilder MapUpdateProductEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapPut("/api/products/{id}", async (HttpContext ctx, int id, [FromBody] Product product, [FromServices] AppDbContext context) =>
        {
            if (!ctx.User.Identity!.IsAuthenticated)
                return Results.Problem(
                    detail: "Authentication required",
                    title: "Unauthorized",
                    statusCode: StatusCodes.Status401Unauthorized,
                    type: "https://tools.ietf.org/html/rfc7235#section-3.1"
                );

            var existing = await context.Products.FindAsync(id);
            if (existing == null)
                return Results.Problem(
                    detail: $"Product with id {id} not found",
                    title: "Not Found",
                    statusCode: StatusCodes.Status404NotFound,
                    type: "https://tools.ietf.org/html/rfc7231#section-6.5.4"
                );

            existing.Name = product.Name;
            existing.Description = product.Description;
            existing.Price = product.Price;
            existing.Category = product.Category;
            existing.Image = product.Image;
            if (product.Rating != null)
            {
                existing.Rating = product.Rating;
            }
            await context.SaveChangesAsync();

            return Results.Ok(existing);
        });

        return app;
    }
}
