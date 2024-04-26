// The poor man's jQuery
window.$ = (query, el=document)=>{
    return document.querySelector(query);
};
window.$all = (query, el=document)=>{
    return [...document.querySelectorAll(query)];
};

window.addEventListener("DOMContentLoaded", ()=>{

    // ARTICLE SUMMARIES
    // Scale the thumnails:
    $all(".article-summary").forEach( (article)=>{
        $("#article-thumb", article).style.height = getComputedStyle(article).height;
    });

    /////////////////////////////////////////////////////////////
    // SIDEBAR SHTUFF ///////////////////////////////////////////
    /////////////////////////////////////////////////////////////

    // SIDEBAR TABS
    // Each one toggles its respective sidebar panel
    $all("#sidebar_tabs > div").forEach( (tab)=>{
        let panelName = tab.id.slice(4); // after "tab_"
        tab.onclick = ()=>{
            document.body.setAttribute("sidebar_state", "open");
            if(currentPanelName == panelName){
                closePanel();
            }else{
                revealPanel(panelName);
            }
        };
    });

    // SIDEBAR PANELS
    let currentPanelName = '';
    // Reveal 'em
    let revealPanel = (panelName)=>{
        // Remember current one
        currentPanelName = panelName;
        // Open up
        document.body.setAttribute("sidebar_state", "open");
        // Hide all except one
        $all("#sidebar > div").forEach( (panelPage)=>{
            panelPage.style.display = 'none';
        });
        $(`#panel_${panelName}`).style.display = 'block';
        // Don't close plz
        startToClose = false;
    };
    // Close 'em
    let closePanel = ()=>{
        currentPanelName = '';
        document.body.setAttribute("sidebar_state", "closed");
    };
    // The overlay behind the panel, above content
    // Must mouse over it for >0.5s to count
    let closeCountdown = 0,
        startToClose = false;
    $("#return_to_content").onmouseover = ()=>{
        closeCountdown = 100;
        startToClose = true;
    };
    $("#return_to_content").onmouseleave = ()=>{
        startToClose = false;
    };
    setInterval(()=>{
        if(startToClose){
            if(closeCountdown<=0) closePanel();
            else closeCountdown-=10;
        }
    },10);

    // HACK: Catching scrolls on Table of Contents only
    let panel_toc = $("#panel_toc");
    panel_toc.addEventListener("scroll",(e)=>{
        e.stopPropagation();
    },true);
    // sidebar overflow hide
    // thx https://gist.github.com/kevsimpson/7309923
    panel_toc.onmouseover = ()=>{
        document.body.style.overflow = 'hidden';
    };
    panel_toc.onmouseout = ()=>{
        document.body.style.overflow = '';
    };

    // SIDEBAR: TABLE OF CONTENTS
    // Populate it!
    let allHeadings = $all("h1, h2, h3, h4, h5, h6");
    let tocHTML = "";

    if(allHeadings.length==0){
        $('#tab_toc').style.display = 'none';
    }else{

        // Add a fake h1 in the beginning!
        let fakeH1 = document.createElement('h1');
        fakeH1.innerText = $('title').innerText;
        fakeH1.style.display = 'none';
        $('#header').insertBefore(fakeH1, $('#header').firstChild);
        allHeadings.unshift(fakeH1);

        // For the rest, though...
        tocHTML = '<ul id="toc_list">';
        allHeadings.forEach( (heading)=>{

            // IF IT'S A COLLAPSED NUTSHELL, SKIP.
            if(heading.innerText.trim()[0]==":") return;

            // Table of Contents link
            let headingText = heading.innerText,
                headingForURI = headingText.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            // What heading hierarchy? that's the indentation! (1em for each past h2)
            let hierarchy = parseInt(heading.tagName[1]);
            if(hierarchy>2){
                let indent = (hierarchy-2);
                tocHTML += `<li style="padding-left:${indent}em">`;
            }else{
                tocHTML += '<li>';
            }
            tocHTML += `<a target='_self' class='black-link' href="#${headingForURI}">${headingText}</a>`;
            tocHTML += '</li>';

            // Anchor in article
            let anchor = document.createElement('a');
            anchor.className = 'scroll-anchor';
            anchor.id = headingForURI;
            heading.parentNode.insertBefore(anchor, heading);

        });
        tocHTML += '</ul>';

        $('#panel_toc').innerHTML = tocHTML;

        // HACK: If ToC is too large... just shrink font until it works
        /*let tocFont = 16;
        do{
            $('#panel_toc').style.fontSize = tocFont+'px';
            tocFont--;
        }while( tocFont>1 && parseInt(window.getComputedStyle($("#panel_toc")).height)+20 > document.body.clientHeight);*/

    }

    // READING CONTROLS
    let updateStyle = ()=>{

        // Dark or not
        let isDark = $("#style_dark_mode").checked;
        document.body.setAttribute("dark_mode", isDark ? "yes" : "no");

        // Font size
        let fontsize = $("#style_fontsize_slider").value + 'px';
        $("#style_fontsize").innerText = fontsize;
        $("#content").style.fontSize = fontsize;

        // Font family
        let selectedFont = $all("input[name=style_font_family]").find( (radioButton)=>{
            return radioButton.checked;
        }).value;
        document.body.setAttribute("font_family", selectedFont);

        // Also update localStorage to save settings across pages
        window.localStorage.style_dark = isDark;
        window.localStorage.style_size = fontsize;
        window.localStorage.style_font = selectedFont;

    };
    // Dark Mode
    $("#style_dark_mode_container").onclick = ()=>{
        $("#style_dark_mode").checked = !$("#style_dark_mode").checked;
        updateStyle();
    }
    // Size
    $("#style_fontsize_slider").oninput = ()=>{
        updateStyle();
    }
    // Font Family
    $all("input[name=style_font_family]").forEach( (radioButton)=>{
        radioButton.onclick = updateStyle;
    });
    // Reset
    let resetStyle = ()=>{
        $("#style_dark_mode").checked = false;
        $("#style_fontsize_slider").value = 19;
        $("input[value=serif]").checked = true;
        updateStyle();
    };
    $("#style_reset").onclick = resetStyle;

    // Save settings across pages
    // Defaults
    window.localStorage.style_dark = window.localStorage.style_dark || false;
    window.localStorage.style_size = window.localStorage.style_size || 19;
    window.localStorage.style_font = window.localStorage.style_font || "serif";
    // Cut off transition CSS
    document.body.style.transition = "none";
    // Set to localStorage's values (remember, they're STRINGS)
    $("#style_dark_mode").checked = (window.localStorage.style_dark=="true");
    $("#style_fontsize_slider").value = parseInt(window.localStorage.style_size);
    $(`input[value=${window.localStorage.style_font}]`).checked = true;
    // Anim!
    setTimeout(()=>{
        updateStyle();
        setTimeout(()=>{
            document.body.style.transition = null;
        },1000);
    },10);

    ////////////////////////////////////////////////////////////
    // SCROLLY for NOT-FRONTPAGE pages /////////////////////////
    ////////////////////////////////////////////////////////////

    // RAF: scroll the text & do parallax
    const splash_image = $("#splash_image"),
          crt_lines = $("#crt_lines"),
          static = $("#static");
    let clicker = 0,
        crtY = 0,
        staticY = 0;
    let animloop = ()=>{
        splash_image.style.top = (window.scrollY*0.3)+"px";
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

    ////////////////////////////////////////////////////////////
    // FOR POSTS: PUB DATE, FEETNOTES, READING TIME ////////////
    ////////////////////////////////////////////////////////////

    // All CONTENT links that go to "#" are self!
    $all('#content a').filter(a=>{
        let href = a.getAttribute('href');
        if(!href) return;
        return href[0]=="#"
    }).forEach(a=>{
        a.target = '_self';
    });

    // Footnotes: Littlefoot 'em, THEN hide with Nutshell
    littlefoot.littlefoot({
        activateOnHover: true,
        hoverDelay: 0,
        dismissOnUnhover: true,
        buttonTemplate: `
        <button
            aria-label="Footnote <% number %>"
            class="littlefoot__button"
            id="<% reference %>"
            title="See Footnote <% number %>"
        />
            <% number %>
        </button>`
    });
    // Make a : footnote header before hiding in Nutshell (if any exist)
    let footnotesDivider = $(".footnotes-sep");
    if(footnotesDivider){

        // Make that header
        let foo = document.createElement("h1");
        foo.innerHTML = ": Click to see all feetnotes 👣";
        $(".footnotes-sep").after(foo);

        // Remove all "↩︎" links
        $all(".footnote-backref").forEach((back)=>{
            back.remove();
        });

    }
    Nutshell.start(); // either way, lol start!

    // READING TIME
    const NUMBER_OF_WORDS = ($("#content").innerText.match(/\s/g) || []).length,
          AVERAGE_READING_SPEED = 180, // well, lowballing it. remember i usually have pictures AND Orbits! AND Nutshells/feetnotes
          READING_TIME_IN_MINUTES = Math.ceil(NUMBER_OF_WORDS/AVERAGE_READING_SPEED);

    // THE CLOCK SCROLLY
    const HEADER_CONTENT_GAP = 48,
          CONTENT_FOOTER_GAP = 67;
    const CLOCK_SPRITESHEET_WIDTH = 12;

    // WHEN SCROLL, UPDATE CLOCK.
    let updateClock = ()=>{

        // Reading Timer... CALCULATE RATIO
        let topOfContent = 0,
            btmOfContent = topOfContent
                           + $("#header").getBoundingClientRect().height
                           + HEADER_CONTENT_GAP
                           + $("#content").getBoundingClientRect().height
                           + CONTENT_FOOTER_GAP;

        let scrollYWhenAtTop = topOfContent,
            scrollYWhenAtBottom = btmOfContent - document.body.clientHeight;

        let range = scrollYWhenAtBottom - scrollYWhenAtTop,
            ratio = (window.scrollY - scrollYWhenAtTop) / range;

        if(ratio<0) ratio=0;
        if(ratio>1) ratio=1;

        //////////////////////////////////////

        // Reading Timer... CLOCK ICON
        let frame = Math.floor(ratio*119); // 120 FRAMES
        let y = Math.floor(frame/CLOCK_SPRITESHEET_WIDTH),
            x = frame % CLOCK_SPRITESHEET_WIDTH,
            bgPosition = `${x*-100}% ${y*-100}%`;
        $("#clock_icon").style.backgroundPosition = bgPosition;

        //////////////////////////////////////

        // Reading Timer... LABEL
        let timeLeft = Math.ceil( (1-ratio)*READING_TIME_IN_MINUTES );
        $("#clock_label").innerHTML = (timeLeft==0) ? "🎉🎉🎉" : `~${timeLeft}m`;

    };
    window.addEventListener("scroll",updateClock);
    updateClock();

});