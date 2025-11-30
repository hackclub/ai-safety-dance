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
let fork1 = $("#fork_1_visual");
let fork2 = $("#fork_2_visual");
let parallaxes = $all(".parallax");
let splash = $("#splash_image");
let scroll_arrow = $("#scroll_arrow");
let hack = $all(".programmatic_hack");
function onScrollChange(){
    const scrollY = getScrollY();
    console.log('Scroll Y:', scrollY);

    // HACK
    hack.forEach(el=>{
        el.style.top = '-135px';
        el.style.height = (window.innerHeight+135)+'px';
    });

    // Scroll arrow
    scroll_arrow.style.display = (scrollY>300) ? "none" : "block";

    // The FORK animations...
    if(scrollY<1600){
        fork1.style.transform = 'scale(1.25) translate(-60px,0)';
    }else if(scrollY<2500){
        fork1.style.transform = 'scale(1.8) translate(0,0)';
    }else if(scrollY<3200){
        fork1.style.transform = 'scale(1.8) translate(-267px,0)';
    }else{
        fork1.style.transform = 'scale(1.25) translate(-60px,-229px)';
    }
    if(scrollY<3200){
        $("#fork_sprite_2").style.opacity = 1;
        $("#fork_sprite_3").style.opacity = 0;
    }else{
        $("#fork_sprite_2").style.opacity = 0;
        $("#fork_sprite_3").style.opacity = 1;
    }
    if(scrollY<9900){
        fork2.style.transform = 'scale(1.25) translate(-60px,-229px)'; //= 'scale(1.1) translate(-30px,-163px)';
        $("#fork_sprite_5").style.opacity = 0;
        $("#fork_sprite_6").style.opacity = 1;
    }else{
        fork2.style.transform = 'scale(1) translate(0,0)';
        $("#fork_sprite_5").style.opacity = 1;
        $("#fork_sprite_6").style.opacity = 0;
    }

    // Thank YOU
    $("#sunset_chars").style.backgroundImage = (scrollY<19300) ? "url('pics/sunset_chars1.png')" : "url('pics/sunset_chars2.png')"

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

        // Parallax the only image in there
        $("img", el).style.top = ((-1+ratio)*400)+"px";

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
