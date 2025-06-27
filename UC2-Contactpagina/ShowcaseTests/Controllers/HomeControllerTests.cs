using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Showcase_Contactpagina.Controllers;
using Showcase_Contactpagina.Models;
using System.Diagnostics;

namespace ShowcaseTests.Controllers
{
    public class HomeControllerTests
    {
        private readonly HomeController _controller;

        public HomeControllerTests()
        {
            var mockLogger = new Moq.Mock<ILogger<HomeController>>();
            _controller = new HomeController(mockLogger.Object);
        }

        [Fact]
        public void Index_ReturnsViewResult()
        {
            // Act
            var result = _controller.Index();

            // Assert
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public void Privacy_ReturnsViewResult()
        {
            // Act
            var result = _controller.Privacy();

            // Assert
            Assert.IsType<ViewResult>(result);
        }

        [Fact]
        public void Error_ReturnsViewResultWithModel()
        {
            // Arrange
            var activity = new Activity("TestActivity");
            activity.Start();
            Activity.Current = activity;

            // Act
            var result = _controller.Error() as ViewResult;

            // Assert
            Assert.NotNull(result);
            var model = result.Model as ErrorViewModel;
            Assert.NotNull(model);
            Assert.False(string.IsNullOrEmpty(model.RequestId));
            Assert.True(model.ShowRequestId);

            activity.Stop();
            Activity.Current = null; // Clean up
        }

    }
}