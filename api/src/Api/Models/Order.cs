namespace Api.Models;

public record OrderItem(
    int ProductId,
    string ProductName,
    decimal Price,
    int Quantity
);

public record Order(
    int Id,
    List<OrderItem> Items,
    decimal Total,
    decimal Shipping,
    string Status,
    DateTime CreatedAt
);

public record OrderRequest(
    List<OrderItem> Items,
    decimal Shipping
);
