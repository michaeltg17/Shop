using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Api.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Api.Tests;

public class ProductsEndpointsTests : IAsyncDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public ProductsEndpointsTests()
    {
        _factory = new WebApplicationFactory<Program>();
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetProducts_ReturnsAllProducts()
    {
        // Act
        var response = await _client.GetAsync("/api/products");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var bodies = await response.Content.ReadFromJsonAsync<List<Product>>();
        bodies!.Should().HaveCount(3);
    }

    [Fact]
    public async Task GetProductById_WhenExists_ReturnsProduct()
    {
        // Act
        var response = await _client.GetAsync("/api/products/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<Product>();
        body!.Should().NotBeNull();
        body!.Id.Should().Be(1);
    }

    [Fact]
    public async Task GetProductById_WhenNotExists_ReturnsNotFound()
    {
        // Act
        var response = await _client.GetAsync("/api/products/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task CreateProduct_ReturnsCreatedProduct()
    {
        // Arrange
        var product = new Product(0, "Monitor", "4K Display", 399.99m);
        var content = new StringContent(
            JsonSerializer.Serialize(product),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PostAsync("/api/products", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<Product>();
        body!.Should().NotBeNull();
        body!.Id.Should().BeGreaterThan(0);
        body!.Name.Should().Be("Monitor");
    }

    [Fact]
    public async Task UpdateProduct_WhenExists_ReturnsUpdatedProduct()
    {
        // Arrange
        var product = new Product(0, "Updated Laptop", "Updated description", 1099.99m);
        var content = new StringContent(
            JsonSerializer.Serialize(product),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PutAsync("/api/products/1", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<Product>();
        body!.Should().NotBeNull();
        body!.Id.Should().Be(1);
        body!.Name.Should().Be("Updated Laptop");
    }

    [Fact]
    public async Task UpdateProduct_WhenNotExists_ReturnsNotFound()
    {
        // Arrange
        var product = new Product(0, "New Product", "Description", 9.99m);
        var content = new StringContent(
            JsonSerializer.Serialize(product),
            Encoding.UTF8,
            "application/json");

        // Act
        var response = await _client.PutAsync("/api/products/999", content);

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task DeleteProduct_WhenExists_ReturnsNoContent()
    {
        // Act
        var response = await _client.DeleteAsync("/api/products/1");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    [Fact]
    public async Task DeleteProduct_WhenNotExists_ReturnsNotFound()
    {
        // Act
        var response = await _client.DeleteAsync("/api/products/999");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    public async ValueTask DisposeAsync()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }
}