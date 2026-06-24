using System.Net;
using System.Text.Json;
using AwesomeAssertions;

namespace Api.Tests.Helpers;

public static class AssertProblemDetailsHelper
{
    public static async Task AssertProblemDetailsAsync(
        HttpResponseMessage response,
        HttpStatusCode expectedStatus,
        CancellationToken ct = default)
    {
        response.StatusCode.Should().Be(expectedStatus);

        var ct2 = response.Content.Headers.ContentType;
        ct2.Should().NotBeNull();
        ct2!.MediaType.Should().BeOneOf("application/problem+json", "application/json");

        var body = await response.Content.ReadAsStringAsync(ct);
        var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;

        root.TryGetProperty("type", out _).Should().BeTrue();
        root.TryGetProperty("title", out _).Should().BeTrue();
        root.TryGetProperty("status", out var status).Should().BeTrue();

        status.GetInt32().Should().Be((int)expectedStatus);
    }
}
