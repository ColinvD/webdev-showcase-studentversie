using Microsoft.AspNetCore.Mvc;

namespace Showcase_Profielpagina.Controllers
{
    public class TeamController : Controller
    {
        [Route("Team/TopTeam")]
        [Route("Team")]
        public IActionResult Index()
        {
            return View("TopTeam");
        }
    }
}
