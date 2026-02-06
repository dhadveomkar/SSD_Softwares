using BCrypt.Net;
using Microsoft.AspNetCore.Mvc;
using Microsoft.CodeAnalysis.Scripting;
using Microsoft.EntityFrameworkCore;
using Omnas.Api.Data; // Ensure this matches your namespace
using Omnas.Api.Models; // Ensure this matches your namespace
using System;

namespace Omnas.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase // Use ControllerBase for APIs
    {
        private readonly BackendDbContext _context;

        public AccountController(BackendDbContext context)
        {
            _context = context;
        }

        // POST: api/account/signup
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromBody] UserRegistrationDto model)
        {
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest(new { message = "Email already registered" });
            }

            // Encrypt the password before saving
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(model.Password);

            var newUser = new User
            {
                Email = model.Email,
                PasswordHash = passwordHash,
                Role = "Viewer" // Default role for safety
            };

            _context.Users.Add(newUser);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful" });
        }

        // POST: api/account/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] UserLoginDto model)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(model.Password, user.PasswordHash))
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            // Return user info and role to the Angular frontend
            return Ok(new
            {
                email = user.Email,
                role = user.Role,
                message = "Login successful"
            });
        }
    }
}