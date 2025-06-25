using Microsoft.AspNetCore.SignalR;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace Showcase_Contactpagina.Hubs
{
    public class GameHub : Hub
    {
        private static ConcurrentDictionary<string, string> ConnectedUsers = new();

        public override async Task OnConnectedAsync()
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            ConnectedUsers[Context.ConnectionId] = username;
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            if (ConnectedUsers.TryRemove(Context.ConnectionId, out var username))
            {
                // Informeer alle andere clients dat deze speler vertrokken is
                await Clients.Others.SendAsync("RemovePlayer", username);

            }

            await base.OnDisconnectedAsync(exception);
        }
        public async Task UpdatePosition(string username, float x, float y)
        {
            await Clients.Others.SendAsync("ReceivePlayerPosition", username, x, y);
        }
    }
}