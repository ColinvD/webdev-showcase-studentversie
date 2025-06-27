using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
namespace ShowcaseTests.Helpers
{
    public static class HttpMessageHandlerExtensions
    {
        public static Task<HttpResponseMessage> SendAsync(this HttpMessageHandler handler, HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return handler.SendAsync(request, cancellationToken);
        }
    }
}

