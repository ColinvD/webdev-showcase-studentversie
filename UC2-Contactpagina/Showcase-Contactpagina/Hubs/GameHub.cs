using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace Showcase_Contactpagina.Hubs
{
    public class GameHub : Hub
    {
        public async Task UpdatePosition(string username, float x, float y)
        {
            await Clients.Others.SendAsync("ReceivePlayerPosition", username, x, y);
        }
    }
}