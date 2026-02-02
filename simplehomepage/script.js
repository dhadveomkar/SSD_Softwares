// Scroll reveal animation
const reveals = document.querySelectorAll('.reveal');

window.addEventListener('scroll', () => {
    reveals.forEach(e1 =>{
        const top = e1.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        if(top < windowHeight - 100){
            e1.classList.add('active');
        }
    });
});

// Mobile menu toggle
const menuBtn = document.querySelector('.menu-btn');
const nav = document.querySelector(".navbar nav");

menuBtn.addEventListener('click', () => {
    nav.computedStyleMap.display === "flex" ? "none" : "flex";
});
