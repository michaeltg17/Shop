using System.Collections.Concurrent;
using Api.Models;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen();
}

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// In-memory storage
var seedProducts = new List<Product>
{
    new(1, "Laptop", "High-performance laptop", 999.99m),
    new(2, "Mouse", "Wireless ergonomic mouse", 29.99m),
    new(3, "Keyboard", "Mechanical keyboard", 79.99m)
};

var products = new ConcurrentDictionary<int, Product>(seedProducts.ToDictionary(p => p.Id, p => p));

int nextId = 4;

// GET /api/products
app.MapGet("/api/products", () =>
    products.Values.ToList());

// GET /api/products/{id}
app.MapGet("/api/products/{id}", (int id) =>
    products.TryGetValue(id, out var product)
        ? Results.Ok(product)
        : Results.NotFound())
    .WithName("GetProduct");

// POST /api/products
app.MapPost("/api/products", (Product product) =>
{
    var newProduct = product with { Id = Interlocked.Increment(ref nextId) };
    products.TryAdd(newProduct.Id, newProduct);
    return Results.CreatedAtRoute("GetProduct", new { id = newProduct.Id }, newProduct);
});

// PUT /api/products/{id}
app.MapPut("/api/products/{id}", (int id, Product product) =>
{
    if (!products.ContainsKey(id))
        return Results.NotFound();

    var updatedProduct = product with { Id = id };
    products[id] = updatedProduct;
    return Results.Ok(updatedProduct);
});

// DELETE /api/products/{id}
app.MapDelete("/api/products/{id}", (int id) =>
{
    if (!products.TryRemove(id, out _))
        return Results.NotFound();

    return Results.NoContent();
});

app.Run();