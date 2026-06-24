using System.Net;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Tests.Helpers;
using AwesomeAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

namespace Api.Tests;

public class UsersEndpointsTests : IAsyncDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;

    public UsersEndpointsTests()
    {
        _factory = new WebApplicationFactory<Program>();
        TestBase.Migrate(_factory);
        _client = _factory.CreateClient();
    }

    [Fact]
    public async Task GetUsers_WithoutAuth_ReturnsUnauthorized()
    {
        var response = await _client.GetAsync("/api/users", TestContext.Current.CancellationToken);

        await AssertProblemDetailsHelper.AssertProblemDetailsAsync(response, HttpStatusCode.Unauthorized, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task CreateUser_WithoutAuth_ReturnsUnauthorized()
    {
        var req = new { Email = "new@shop.com", Password = "Password1!", Role = "Customer" };
        var content = new StringContent(
            JsonSerializer.Serialize(req),
            Encoding.UTF8,
            "application/json");

        var response = await _client.PostAsync("/api/users", content, TestContext.Current.CancellationToken);

        await AssertProblemDetailsHelper.AssertProblemDetailsAsync(response, HttpStatusCode.Unauthorized, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task UpdateUser_WithoutAuth_ReturnsUnauthorized()
    {
        var req = new { Email = "updated@shop.com", IsActive = true };
        var content = new StringContent(
            JsonSerializer.Serialize(req),
            Encoding.UTF8,
            "application/json");

        var response = await _client.PutAsync("/api/users/999", content, TestContext.Current.CancellationToken);

        await AssertProblemDetailsHelper.AssertProblemDetailsAsync(response, HttpStatusCode.Unauthorized, TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task DeleteUsers_WithoutAuth_ReturnsUnauthorized()
    {
        var ids = new List<string> { "some-guid" };
        var content = new StringContent(
            JsonSerializer.Serialize(ids),
            Encoding.UTF8,
            "application/json");

        var request = new HttpRequestMessage(HttpMethod.Delete, "/api/users")
        {
            Content = content
        };
        var response = await _client.SendAsync(request, TestContext.Current.CancellationToken);

        await AssertProblemDetailsHelper.AssertProblemDetailsAsync(response, HttpStatusCode.Unauthorized, TestContext.Current.CancellationToken);
    }

    public async ValueTask DisposeAsync()
    {
        _client.Dispose();
        await _factory.DisposeAsync();
    }
}
