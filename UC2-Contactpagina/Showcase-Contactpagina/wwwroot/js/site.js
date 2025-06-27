// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.
//const site = new Site();
//site.validateRecaptcha(); // Roep validateRecaptcha aan

//if (!site.allowSubmit) { // Gebruik hier site.allowSubmit
//    alert("Gelieve de reCAPTCHA te voltooien.");
//    return; // Stop de form submit als reCAPTCHA niet voltooid is
//}

class Site {
    validateRecaptcha() {
        const recaptchaResponse = grecaptcha.getResponse(); // Verkrijg de reCAPTCHA reactie
        console.log('reCAPTCHA Response:', recaptchaResponse); // Debugging

        if (recaptchaResponse.length === 0) {
            console.log('reCAPTCHA niet ingevuld!');
            this.allowSubmit = false; // Validatie mislukt, set allowSubmit to false
            return false;
        } else {
            this.allowSubmit = true; // Als reCAPTCHA is ingevuld, allowSubmit wordt true
            return true;
        }
    }
}