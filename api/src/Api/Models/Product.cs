using System.Text.Json.Serialization;

namespace Api.Models;

public record Product(
    [property: JsonPropertyName("id")] int Id,
    [property: JsonPropertyName("title")] string Name,
    [property: JsonPropertyName("description")] string Description,
    [property: JsonPropertyName("price")] decimal Price,
    [property: JsonPropertyName("category")] string Category = "",
    [property: JsonPropertyName("image")] string Image = "",
    [property: JsonPropertyName("rating")] ProductRating? Rating = null
);

public record ProductRating(
    [property: JsonPropertyName("rate")] double Rate,
    [property: JsonPropertyName("count")] int Count
);