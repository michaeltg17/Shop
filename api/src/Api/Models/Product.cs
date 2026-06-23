using System.Text.Json.Serialization;

namespace Api.Models;

public class Product
{
    [JsonPropertyName("id")] public int Id { get; set; }
    [JsonPropertyName("title")] public string Name { get; set; } = "";
    [JsonPropertyName("description")] public string Description { get; set; } = "";
    [JsonPropertyName("price")] public decimal Price { get; set; }
    [JsonPropertyName("category")] public string Category { get; set; } = "";
    [JsonPropertyName("image")] public string Image { get; set; } = "";
    [JsonPropertyName("rating")] public ProductRating? Rating { get; set; }
}

public class ProductRating
{
    [JsonPropertyName("rate")] public double Rate { get; set; }
    [JsonPropertyName("count")] public int Count { get; set; }
}