window.addEventListener("load", ()=>{

    // All work and no play makes Nicky a dull girl.
    /*let phrases = [
        "The quick brown fox jumps over the lazy dog. ",
        "All work and no play makes Nicky a dull girl. ",
        "She sells sea shells by the sea shore. ",
        "Lorem ipsum dolor sit amet. ",
    ];
    let phrase = phrases[ Math.floor( Math.random()*phrases.length ) ];*/
    let phrase = "All work and no play makes Nicky a dull girl. ";
    let weirdText = (new Array(5000)).join(phrase);
    $("#scrolly_text").innerHTML = weirdText;

    // Animate the header title
    let titleFrame = 0;
    setInterval(()=>{
        titleFrame = (titleFrame+1)%3;
        $("#header_title").style.backgroundPosition = `0px ${titleFrame*380}px`;
    }, 10*1000/15); // Every tenth frame on 15fps

    // RAF: scroll the text & do parallax
    let y = 0;
    let animloop = ()=>{
        y -= 0.15;
        $("#header_title").style.top = (window.scrollY*0.3)+"px";
        $("#scrolly_text").style.top = (y + window.scrollY*0.8)+"px";
        requestAnimationFrame(animloop);
    };
    requestAnimationFrame(animloop);

});