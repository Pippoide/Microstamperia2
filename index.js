function stabilizeImages() {
    const images = document.querySelectorAll("img");

    images.forEach(img => {
        // Salta immagini SVG inline o immagini non ancora caricate
        if (!img.complete || img.naturalWidth === 0 || img.src.endsWith(".svg")) return;

        // Imposta width e height se non presenti
        if (!img.hasAttribute("width")) img.setAttribute("width", img.naturalWidth);
        if (!img.hasAttribute("height")) img.setAttribute("height", img.naturalHeight);

        // Aggiunge lazy loading se non specificato
        if (!img.hasAttribute("loading")) img.setAttribute("loading", "lazy");
    });
}

// Esegui quando tutto è caricato
window.addEventListener("load", stabilizeImages);

gsap.registerPlugin(Draggable, InertiaPlugin);

for (let i = 1; i <= 25; i++) {
    Draggable.create(`#drag${i}`, {
        type: "x,y",
        bounds: ".cover",
        inertia: true,
        onDrag: function () {
            const xPosition = this.x;
            const yPosition = this.y;
            const rotation = (xPosition + yPosition) % 360;
            gsap.set(this.target, { rotation: rotation });
        }
    });
}


Draggable.create("#stampa", {
    type: "x,y",
    bounds: ".risograph",
    inertia: true,
    onDrag: function () {
        const xPosition = this.x;

    }
});



let slider = document.getElementById("slider")
let drag
let startX
let maxTranslate = ((document.querySelectorAll('.book').length) * document.querySelector('.book').offsetWidth) - window.innerWidth;
//maxTranslate+=(16*3)
maxTranslate = -1 * maxTranslate
let prevTranslate = getTranslateX(slider)

slider.addEventListener('mousedown', (e) => {
    drag = true;
    startX = e.clientX
    prevTranslate = getTranslateX(slider) || 0;
    slider.classList.add("cursor-grabbing");
    slider.classList.remove("hover:cursor-grab");
});
let movimento = 0

slider.addEventListener('mousemove', (e) => {
    if (!drag) return;
    const x = getTranslateX(slider);
    delta = e.clientX - startX;
    currentTranslate = prevTranslate + delta;
    console.log(currentTranslate)
    console.log(maxTranslate)
    if (currentTranslate > 0) currentTranslate = 0;
    if (currentTranslate < maxTranslate) currentTranslate = maxTranslate;
    slider.style.transform = "translateX(" + currentTranslate + "px)";
});

slider.addEventListener('mouseup', (e) => {
    drag = false
    slider.classList.remove("cursor-grabbing");
    slider.classList.add("hover:cursor-grab");
})
slider.addEventListener('mouseleave', (e) => {
    slider.classList.remove("cursor-grabbing");
    slider.classList.add("hover:cursor-grab");

    drag = false
})

function getTranslateX(element) {
    const style = window.getComputedStyle(element);
    const matrix = new DOMMatrix(style.transform);
    return matrix.m41; // valore di translateX
}

slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    prevTranslate = getTranslateX(slider) || 0;
}, { passive: true });

// Touch move
slider.addEventListener('touchmove', (e) => {
    if (!isDragging) return;

    const delta = e.touches[0].clientX - startX;
    currentTranslate = prevTranslate + delta;

    // limiti
    if (currentTranslate > 0) currentTranslate = 0;
    if (currentTranslate < maxTranslate) currentTranslate = maxTranslate;

    slider.style.transform = "translateX(" + currentTranslate + "px)";
}, { passive: true });

// Touch end
slider.addEventListener('touchend', () => {
    isDragging = false;
});

/*
gsap.registerPlugin(ScrollTrigger);

let iteration = 0; // gets iterated when we scroll all the way to the end or start and wraps around - allows us to smoothly continue the playhead scrubbing in the correct direction.

const spacing = 0.1,    // spacing of the cards (stagger)
    snap = gsap.utils.snap(spacing), // we'll use this to snap the playhead on the seamlessLoop
    cards = gsap.utils.toArray('.cards li'),
    seamlessLoop = buildEffect(cards, spacing),
    scrub = gsap.to(seamlessLoop, { // we reuse this tween to smoothly scrub the playhead on the seamlessLoop
        totalTime: 0,
        duration: 0.5,
        ease: "power3",
        paused: true
    }),
    trigger = ScrollTrigger.create({
        trigger: '.gallery',
        start: 'top top',
        end: () => '+=3000',
        pin: ".gallery",
        anticipatePin: 1,
        onUpdate(self) {
            if (self.progress < 1 || self.progress > 0) {
                scrub.vars.totalTime = snap(
                    self.progress * seamlessLoop.duration()
                );
                scrub.invalidate().restart();
            }
        },

    });

function wrapForward(trigger) { // when the ScrollTrigger reaches the end, loop back to the beginning seamlessly
    iteration++;
    trigger.wrapping = true;
    trigger.scroll(trigger.start + 1);
}

function wrapBackward(trigger) { // when the ScrollTrigger reaches the start again (in reverse), loop back to the end seamlessly
    iteration--;
    if (iteration < 0) { // to keep the playhead from stopping at the beginning, we jump ahead 10 iterations
        iteration = 9;
        seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
        scrub.pause(); // otherwise it may update the totalTime right before the trigger updates, making the starting value different than what we just set above. 
    }
    trigger.wrapping = true;
    trigger.scroll(trigger.end - 1);
}


function calculateVisibleItems(length) {
    /*if(length>7)
      return 2;
    if(length<5)
      return 2;
    return 3; //return 1 ovvero il numero di libri visibili
}

function buildEffect(items, spacing) {
    let
        cardsVisible = calculateVisibleItems(items.length), // atleast +1 card should be there to perform this transition for 3 there should be 4 cards
        cardDuration = (Math.ceil(cardsVisible / 2)) * spacing, //according to visible number of cards, we will decide in what progress cards should go 0-1 opacity or 1-0 opacity. e.g if 3 should be visible then - 0.0, 0.1 , 0.2 so at 0.2 it should complete 
        startTime = items.length * spacing + cardDuration, //100vh * 
        loopTime = startTime + (items.length * spacing) - spacing,
        rawSequence = gsap.timeline({ paused: true }),
        seamlessLoop = gsap.timeline({
            paused: true,
            repeat: -1,
            onRepeat() {
                this._time === this._dur && (this._tTime += this._dur - 0.01);
            }
        }),
        time = 0,
        i, index, item;

    // set initial state of items
    gsap.set(items, { xPercent: 200, opacity: 0, scale: 0 });
    //total items should be double of length--it will start on 1st item of second instance of list
    //there should be extra cards visible on end of 2nd instance of list to make it look like it is in loop
    for (i = 0; i < (items.length * 2 + cardsVisible); i++) {
        index = i % items.length;
        item = items[index];
        time = i * spacing;
        //yoyo & repeat is to make 0-1-0 effect for scale and opacity in this case/
        rawSequence.fromTo(item, { scale: 1, opacity: 0 }, { scale: 1, opacity: 1, zIndex: 100, duration: cardDuration, repeat: 1, yoyo: true, ease: "power1.in", immediateRender: false }, time)
            //distance between cards -- it needs to run once only while above should be run twice. 0-1-0 with 400 - 0 - -400 or vice versa
            .fromTo(item, { xPercent: 400 }, { xPercent: -400, duration: cardDuration * 2, ease: "none", immediateRender: false }, time);
    }

    rawSequence.time(startTime);

    seamlessLoop.to(rawSequence, {
        time: loopTime,
        duration: (loopTime - startTime),
        ease: "none"
    })
    return seamlessLoop;
}

//sm >= 648px
//md = >=768
//lg >= 1024
//xl>=1280px

*/