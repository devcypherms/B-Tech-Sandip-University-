// HEADER SCROLL

window.addEventListener("scroll", function(){

    const header = document.querySelector(".main-header");

    if(window.scrollY > 50){

        header.style.background = "#000E25";

    }else{

        header.style.background = "#001B44";

    }

});


// PROGRAM TABS

const tabs = document.querySelectorAll(".program-tab");

const contents = document.querySelectorAll(".program-content");

tabs.forEach(tab => {

    tab.addEventListener("click", () => {

        tabs.forEach(btn => btn.classList.remove("active"));

        contents.forEach(content => {
            content.classList.remove("active");
        });

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.tab)
            .classList.add("active");

    });

});


// FAQ

const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach(item => {

    const question = item.querySelector(".faq-question");

    question.addEventListener("click", () => {

        faqItems.forEach(faq => {

            if(faq !== item){

                faq.classList.remove("active");

            }

        });

        item.classList.toggle("active");

    });

});


// COUNTERS

const counters = document.querySelectorAll(".counter");

let started = false;

function startCounter(){

    counters.forEach(counter => {

        const target = +counter.getAttribute("data-target");

        let count = 0;

        const increment = target / 100;

        const updateCounter = () => {

            count += increment;

            if(count < target){

                counter.innerText = Math.ceil(count);

                requestAnimationFrame(updateCounter);

            }else{

                counter.innerText = target;

            }

        };

        updateCounter();

    });

}

window.addEventListener("scroll", () => {

    const section = document.querySelector(".placement-section");

    const sectionTop = section.offsetTop - 400;

    if(window.scrollY > sectionTop && !started){

        startCounter();

        started = true;

    }

});

// CAMPUS TABS

const campusTabs = document.querySelectorAll(".campus-tab");
const campusContents = document.querySelectorAll(".campus-content");

campusTabs.forEach(tab => {

    tab.addEventListener("click", () => {

        campusTabs.forEach(btn => btn.classList.remove("active"));

        campusContents.forEach(content => {
            content.classList.remove("active");
        });

        tab.classList.add("active");

        document
            .getElementById(tab.dataset.campus)
            .classList.add("active");

    });

});