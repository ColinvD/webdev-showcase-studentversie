using Xunit;
using Moq;
using Showcase_Contactpagina.Controllers;
using Showcase_Contactpagina.Models;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http;
using System.Threading.Tasks;
using System.Threading;
using System.Text;
using Moq.Protected;

namespace ShowcaseTests.Controllers
{
    public class ContactControllerTests
    {
        private Contactform GetValidForm() => new Contactform
        {
            FirstName = "Jan",
            LastName = "Jansen",
            Email = "jan@example.com",
            Phone = "0612345678",
            Subject = "Vraag over game",
            Message = "Hallo, ik heb een vraag over jullie racegame."
        };

        [Fact]
        public async Task Index_Post_ValidForm_ReturnsSuccessView()
        {
            // Arrange
            var handlerMock = new Mock<HttpMessageHandler>();
            handlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK
                });

            var httpClient = new HttpClient(handlerMock.Object)
            {
                BaseAddress = new Uri("https://localhost:7278")
            };

            var controller = new ContactController(httpClient);
            var form = GetValidForm();

            // Act
            var result = await controller.Index(form) as ViewResult;

            // Assert
            Assert.NotNull(result);
            Assert.True(controller.ModelState.IsValid);
            Assert.Equal("Het contactformulier is verstuurd", result?.ViewData["Message"]);
        }

        [Fact]
        public async Task Index_Post_InvalidModel_ReturnsViewWithErrors()
        {
            // Arrange
            var httpClient = new HttpClient(); // Geen mock nodig: wordt niet aangeroepen
            var controller = new ContactController(httpClient);

            var invalidForm = new Contactform(); // Leeg, dus ongeldig
            controller.ModelState.AddModelError("FirstName", "Voornaam is verplicht");

            // Act
            var result = await controller.Index(invalidForm) as ViewResult;

            // Assert
            Assert.NotNull(result);
            Assert.False(controller.ModelState.IsValid);
            Assert.Equal("De ingevulde velden voldoen niet aan de gestelde voorwaarden", result?.ViewData["Message"]);
        }

        [Fact]
        public async Task Index_Post_ApiFailure_ReturnsErrorMessage()
        {
            // Arrange
            var handlerMock = new Mock<HttpMessageHandler>();
            handlerMock
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.InternalServerError
                });

            var httpClient = new HttpClient(handlerMock.Object)
            {
                BaseAddress = new Uri("https://localhost:7278")
            };

            var controller = new ContactController(httpClient);
            var form = GetValidForm();

            // Act
            var result = await controller.Index(form) as ViewResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Er is iets misgegaan", result?.ViewData["Message"]);
        }
    }
}