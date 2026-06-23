namespace Api.Models;

public class OrderItem
{
    public int Id { get; set; }
    public int OrderId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = "";
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public Order? Order { get; set; }
}

public class Order
{
    public int Id { get; set; }
    public List<OrderItem> Items { get; set; } = new();
    public decimal Total { get; set; }
    public decimal Shipping { get; set; }
    public string Status { get; set; } = "";
    public DateTime CreatedAt { get; set; }
}

public record OrderRequest(
    List<OrderItemRequest> Items,
    decimal Shipping
);

public record OrderItemRequest(
    int ProductId,
    string ProductName,
    decimal Price,
    int Quantity
);
