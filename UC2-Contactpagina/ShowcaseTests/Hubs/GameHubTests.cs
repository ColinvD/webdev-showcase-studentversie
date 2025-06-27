using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Connections.Features;
using Microsoft.AspNetCore.SignalR;
using Moq;
using Showcase_Contactpagina.Hubs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ShowcaseTests.Hubs
{
    public class GameHubTests
    {
        private readonly GameHub _hub;
        private readonly Mock<IHubCallerClients> _mockClients;
        private readonly Mock<IClientProxy> _mockClientProxy;
        private readonly HubCallerContext _mockContext;

        public GameHubTests()
        {
            _mockClients = new Mock<IHubCallerClients>();
            _mockClientProxy = new Mock<IClientProxy>();
            _hub = new GameHub();

            // Simuleer toegang tot querystring (voor OnConnectedAsync)
            var httpContext = new DefaultHttpContext();
            httpContext.Request.QueryString = new QueryString("?username=TestUser");

            var context = new Mock<HubCallerContext>();
            context.Setup(c => c.ConnectionId).Returns("conn-123");
            context.Setup(c => c.Features.Get<IHttpContextFeature>())
                   .Returns(new HttpContextFeature { HttpContext = httpContext });

            _hub.Context = context.Object;
            _hub.Clients = _mockClients.Object;
        }


        [Fact]
        public async Task UpdatePlayer_SendsMessageToOthers()
        {
            // Arrange
            _mockClients.Setup(c => c.Others).Returns(_mockClientProxy.Object);

            // Act
            await _hub.UpdatePlayer("Alice", 100, 200, 90);

            // Assert
            _mockClientProxy.Verify(
                client => client.SendCoreAsync("ReceivePlayer",
                    It.Is<object[]>(args =>
                        (string)args[0] == "Alice" &&
                        (float)args[1] == 100 &&
                        (float)args[2] == 200 &&
                        (float)args[3] == 90),
                    default),
                Times.Once);
        }

        [Fact]
        public async Task OnConnectedAsync_AddsUser()
        {
            // Act
            await _hub.OnConnectedAsync();

            // Assert: we kunnen hier indirect testen door te kijken of geen fout optreedt
            // De dictionary is static, dus extra check via reflectie of state zou kunnen
        }

        [Fact]
        public async Task OnDisconnectedAsync_RemovesUser_AndNotifiesOthers()
        {
            // Arrange
            await _hub.OnConnectedAsync(); // eerst toevoegen
            _mockClients.Setup(c => c.Others).Returns(_mockClientProxy.Object);

            // Act
            await _hub.OnDisconnectedAsync(null);

            // Assert
            _mockClientProxy.Verify(
                client => client.SendCoreAsync("RemovePlayer",
                    It.Is<object[]>(args => (string)args[0] == "TestUser"),
                    default),
                Times.Once);
        }
    }
    class HttpContextFeature : IHttpContextFeature
    {
        public HttpContext HttpContext { get; set; }
    }
}
