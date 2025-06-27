using Xunit;
using Showcase_Contactpagina.Controllers;
using Showcase_Contactpagina.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Reflection;
using System;
using System.Linq;

namespace ShowcaseTests.Controllers
{
    public class GameControllerTests
    {
        private GameController GetControllerWithSession(out ISession session)
        {
            var controller = new GameController();
            var httpContext = new DefaultHttpContext();
            session = new TestSession();
            httpContext.Session = session;
            controller.ControllerContext = new ControllerContext()
            {
                HttpContext = httpContext
            };
            return controller;
        }

        [Fact]
        public void Register_Post_ValidUser_RedirectsToLogin()
        {
            // Arrange
            var controller = new GameController();
            var user = new User { Username = "test", Email = "test@test.com", PasswordHash = "pass", Role = UserRole.Normal };

            // Act
            var result = controller.Register(user) as RedirectToActionResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Login", result.ActionName);
        }

        [Fact]
        public void Register_Post_InvalidModel_ReturnsView()
        {
            // Arrange
            var controller = new GameController();
            controller.ModelState.AddModelError("Email", "Email is verplicht");

            var user = new User();

            // Act
            var result = controller.Register(user) as ViewResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(user, result.Model);
        }

        [Fact]
        public void Login_ValidCredentials_RedirectsToPlay()
        {
            // Arrange
            var controller = GetControllerWithSession(out var session);

            var testUser = new User
            {
                Username = "tester",
                Email = "t@test.com",
                Role = UserRole.Paid
            };
            testUser.PasswordHash = BCrypt.Net.BCrypt.HashPassword("123");

            // Gebruik reflection om user lijst toe te voegen
            var usersField = typeof(GameController).GetField("users", BindingFlags.Static | BindingFlags.NonPublic);
            var userList = usersField.GetValue(null) as List<User>;
            userList.Clear();
            userList.Add(testUser);

            // Act
            var result = controller.Login("t@test.com", "123") as RedirectToActionResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Play", result.ActionName);
        }

        [Fact]
        public void Login_InvalidCredentials_ReturnsViewWithError()
        {
            // Arrange
            var controller = new GameController();

            // Act
            var result = controller.Login("fake@mail.com", "fake") as ViewResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal("Ongeldige login", controller.ViewBag.Error);
        }
    }
}