using Microsoft.AspNetCore.SignalR.Client;
using Microsoft.AspNetCore.Mvc.Testing;
using Showcase_Contactpagina;
using Xunit;
using System.Threading.Tasks;
using System;
using System.Collections.Generic;

namespace ShowcaseTests.Integration
{
    public class GameHubIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;

        public GameHubIntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task ConnectsToHubAndSendsUpdate()
        {
            // Arrange
            var client = _factory.CreateClient();
            var serverUri = client.BaseAddress?.ToString().TrimEnd('/');
            var hubConnection = new HubConnectionBuilder()
                .WithUrl($"{serverUri}/gamehub?username=TestUser", options =>
                {
                    options.HttpMessageHandlerFactory = _ => _factory.Server.CreateHandler();
                })
                .WithAutomaticReconnect()
                .Build();

            bool received = false;

            hubConnection.On<string, float, float, float>("ReceivePlayer", (username, x, y, angle) =>
            {
                received = true;
            });

            await hubConnection.StartAsync();
            await hubConnection.InvokeAsync("UpdatePlayer", "TestUser", 1f, 1f, 45f);

            // Wacht even om async events af te handelen
            await Task.Delay(500);

            await hubConnection.StopAsync();

            Assert.False(received, "Er zou geen broadcast terug naar jezelf moeten zijn."); // Want: Clients.Others
        }
    }
}
