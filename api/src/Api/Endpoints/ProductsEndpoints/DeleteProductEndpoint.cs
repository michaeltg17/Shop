using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Routing;

namespace Api.Endpoints.ProductsEndpoints;

public static class DeleteProductEndpoint
{
    public static IEndpointRouteBuilder MapDeleteProductEndpoint(this IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/products/{id}", async (HttpContext ctx, int id, [FromServices] AppDbContext context) =>
        {
            if (!ctx.User.Identity!.IsAuthenticated)
                return Results.Problem(
                    detail: "Authentication required",
                    title: "Unauthorized",
                    statusCode: StatusCodes.Status401Unauthorized,
                    type: "https://tools.ietf.org/html/rfc7235#section-3.1"
                );

            var product = await context.Products.FindAsync(id);
            if (product == null)
                return Results.Problem(
                    detail: $"Product with id {id} not found",
                    title: "Not Found",
                    statusCode: StatusCodes.Status404NotFound,
                    type: "https://tools.ietf.org/html/rfc7231#section-6.5.4"
                );

            context.Products.Remove(product);
            await context.SaveChangesAsync();
            return Results.NoContent();
        });

        return app;
    }
}
