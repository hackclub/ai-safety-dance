// The Poor Man's jQuery
const $ = (q,el=document.body)=>el.querySelector(q);
const $all = (q,el=document.body)=>[...el.querySelectorAll(q)];

// Get current scroll position
const getScrollY = () => window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

// Fire function on scroll with throttling for performance
let ticking = false;
window.addEventListener('scroll', ()=>{
    if(!ticking){
        requestAnimationFrame(()=>{
            onScrollChange();
            ticking = false;
        });
        ticking = true;
    }
}, { passive: true }); // improves mobile scroll performance

// ON SCROLL LOGIC
let fork1 = $("#fork_1");
let fork2 = $("#fork_2");
let parallaxes = $all(".parallax");
let splash = $("#splash_image");
function onScrollChange(){
    const scrollY = getScrollY();
    console.log('Scroll Y:', scrollY);

    // The FORK animations...
    if(scrollY<1400){
        fork1.innerText = "look fwd";
    }else if(scrollY<2200){
        fork1.innerText = "look left";
    }else if(scrollY<3250){
        fork1.innerText = "look right";
    }else{
        fork1.innerText = "look back";
    }
    if(scrollY<9600){
        fork2.innerText = "look back";
    }else{
        fork2.innerText = "look fwd";
    }

    // CLAP
    if(scrollY>18200){
        console.log("CLAP");
    }

    // SPLASH: 700 to 1300 => 1 to 0
    let splashOpacity = Math.max(0, Math.min(1, (1300-scrollY)/600));
    splash.style.opacity = splashOpacity;

    // PARALLAX
    parallaxes.forEach((el)=>{
        const rect = el.getBoundingClientRect();
        const totalDistanceToTravel = window.innerHeight + rect.height; // window + box height
        const currentDistanceTraveled = rect.bottom; // track position of bottom of box
        let ratio = 1 - currentDistanceTraveled/totalDistanceToTravel; // (1,0) => (0,1)
        ratio = Math.max(0, Math.min(1,ratio)); // bounded

        // say it
        el.innerText = ratio;

    });

}

// STATIC
const splash_image = $("#splash_image"),
      crt_lines = $("#crt_lines"),
      static = $("#static");
let clicker = 0,
    crtY = 0,
    staticY = 0;
let animloop = ()=>{
    /*splash_image.style.top = (window.scrollY*0.3)+"px";*/
    clicker++;
    if(clicker>3){
        clicker = 0;
        crtY += 5;
        staticY += 100 + Math.floor(Math.random()*100);
        crt_lines.style.backgroundPositionY = crtY+"px";
        static.style.backgroundPositionY = staticY+"px";
    }
    requestAnimationFrame(animloop);
};
requestAnimationFrame(animloop);
