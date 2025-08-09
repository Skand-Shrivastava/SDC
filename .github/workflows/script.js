// Form Validation
document.getElementById("contactForm").addEventListener("submit", function(event){
    event.preventDefault();

    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let message = document.getElementById("message").value.trim();
    let formMessage = document.getElementById("formMessage");

    if(name === "" || email === "" || phone === "" || message === ""){
        formMessage.textContent = "Please fill in all fields.";
        formMessage.style.color = "red";
    } else {
        formMessage.textContent = "Thank you! Your appointment request has been sent.";
        formMessage.style.color = "green";
        document.getElementById("contactForm").reset();
    }
});

// Fade-in animation on scroll
const fadeElements = document.querySelectorAll('.service, .about, .contact');

window.addEventListener('scroll', () => {
    fadeElements.forEach(el => {
        const position = el.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;

        if(position < windowHeight - 100) {
            el.classList.add('show');
        }
    });
});
