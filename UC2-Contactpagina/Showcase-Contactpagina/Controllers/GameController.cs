using Microsoft.AspNetCore.Mvc;
using Showcase_Contactpagina.Models;
using System.Reflection;

namespace Showcase_Contactpagina.Controllers
{
    public class GameController : Controller
    {
        // Simpele in-memory users (tijdelijk)
        private static List<User> users = new();
        public IActionResult Index()
        {
            return View();
        }

        [HttpGet]
        public IActionResult Register() => View();

        [HttpPost]
        public IActionResult Register(User user)
        {
            if (!ModelState.IsValid)
                return View(user);

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(user.PasswordHash);
            users.Add(user);
            return RedirectToAction("Login");
        }

        [HttpGet]
        public IActionResult Login() => View();

        [HttpPost]
        public IActionResult Login(string email, string password)
        {
            var user = users.FirstOrDefault(u => u.Email == email);
            if (user != null && BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
            {
                // Simpele sessie login (uit te breiden)
                HttpContext.Session.SetString("Username", user.Username);
                HttpContext.Session.SetString("Role", user.Role == UserRole.Paid ? "Betaald" : "Normaal");

                return RedirectToAction("Play", "Game");

            }

            ViewBag.Error = "Ongeldige login";
            return View();
        }

        public IActionResult Logout()
        {
            HttpContext.Session.Clear();
            return RedirectToAction("Login");
        }

        public IActionResult Play()
        {
            var username = HttpContext.Session.GetString("Username");
            if (string.IsNullOrEmpty(username))
            {
                // Niet ingelogd → redirect naar login
                return RedirectToAction("Login", "Account");
            }

            ViewBag.Username = username;
            ViewBag.Role = HttpContext.Session.GetString("Role");

            return View("Game");
        }
    }
}
