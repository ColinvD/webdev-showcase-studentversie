using Microsoft.AspNetCore.Mvc;
using Showcase_Contactpagina.Controllers;

namespace HomeUnitTests
{
    public class HomeControllerTests
    {
        [Fact]
        public void Index_ReturnsViewResult()
        {
            var controller = new HomeController(null);
            var result = controller.Index();
            Assert.IsType<ViewResult>(result);
        }
    }
}