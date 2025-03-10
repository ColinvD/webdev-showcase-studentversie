using System.ComponentModel.DataAnnotations;

namespace Showcase_Contactpagina.Models
{
    public class Contactform
    {
        [Required]
        [MinLength(2)]
        [StringLength(60)]
        public string FirstName {  get; set; }

        [Required]
        [MinLength(2)]
        [StringLength(60)]
        public string LastName {  get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [Phone]
        public string Phone { get; set; }

        [Required]
        [MinLength(2)]
        [StringLength(100)]
        public string Subject { get; set; }

        [Required]
        [MinLength(2)]
        [StringLength(600)]
        public string Message { get; set; }
    }
}
