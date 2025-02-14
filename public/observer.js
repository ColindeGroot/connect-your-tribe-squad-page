document.addEventListener("DOMContentLoaded", function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("slide-in");
            }
        });
    }, { threshold: 0.35 }); // zichtbaar van element dat nodig is om uit te voeren heid 1 = 100%, 0.1 = 10%

    document.querySelectorAll(".students .person-list li").forEach(item => {
        observer.observe(item);
    });
    
});
