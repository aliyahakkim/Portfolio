/* ============================================================
   ANIMATED BACKGROUND — Stars + Nebula + Particle Network
   ============================================================ */
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');

let W, H, stars = [], shootingStars = [], particles = [], blobs = [];
let mouse = { x: -9999, y: -9999 };

function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    buildScene();
}

function rnd(min, max) { return Math.random() * (max - min) + min; }

function buildScene() {
    stars = []; particles = []; blobs = []; shootingStars = [];

    const starCount = Math.floor((W * H) / 3200);
    for (let i = 0; i < starCount; i++) {
        const tier = Math.random();
        stars.push({
            x: rnd(0,W), y: rnd(0,H),
            r: tier > 0.92 ? rnd(1.8,3.2) : tier > 0.7 ? rnd(0.9,1.8) : rnd(0.3,0.9),
            alpha: rnd(0.4,1), phase: rnd(0,Math.PI*2), speed: rnd(0.008,0.035),
            color: ['#ffffff','#cce8ff','#a8d8ff','#ffe4b8','#ffd6ff','#d4b8ff'][Math.floor(Math.random()*6)]
        });
    }

    const pCount = Math.min(80, Math.floor((W*H)/14000));
    for (let i = 0; i < pCount; i++) {
        particles.push({ x:rnd(0,W), y:rnd(0,H), vx:rnd(-0.18,0.18), vy:rnd(-0.18,0.18), r:rnd(1.5,3.5), alpha:rnd(0.35,0.75) });
    }

    [
        {cx:0.12,cy:0.08,rx:0.30,ry:0.22,c1:'#1a00ff',c2:'#a78bfa',op:0.13},
        {cx:0.80,cy:0.15,rx:0.28,ry:0.20,c1:'#7c3aed',c2:'#00d4ff',op:0.11},
        {cx:0.50,cy:0.55,rx:0.35,ry:0.28,c1:'#4f00cc',c2:'#7c3aed',op:0.09},
        {cx:0.10,cy:0.80,rx:0.25,ry:0.20,c1:'#a78bfa',c2:'#2dd4bf',op:0.10},
        {cx:0.88,cy:0.75,rx:0.27,ry:0.22,c1:'#7c3aed',c2:'#1a00ff',op:0.10},
    ].forEach(b => blobs.push({...b, phase:rnd(0,Math.PI*2)}));
}

function spawnShootingStar() {
    const angle = rnd(20,55)*Math.PI/180;
    shootingStars.push({
        x:rnd(0,W*0.7), y:rnd(0,H*0.3),
        vx:Math.cos(angle)*rnd(6,14), vy:Math.sin(angle)*rnd(6,14),
        len:rnd(120,260), life:1, decay:rnd(0.012,0.025), width:rnd(1.2,2.6)
    });
}

function hexAlpha(hex,alpha) {
    const r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
}

function drawBlobs() {
    blobs.forEach(b => {
        b.phase += 0.004;
        const pulse = 1 + Math.sin(b.phase)*0.06;
        const rx=b.rx*W*pulse, ry=b.ry*H*pulse, cx=b.cx*W, cy=b.cy*H;
        const max=Math.max(rx,ry);
        const grad = ctx.createRadialGradient(cx,cy,0,cx,cy,max);
        grad.addColorStop(0, hexAlpha(b.c1,b.op*1.6));
        grad.addColorStop(0.5, hexAlpha(b.c2,b.op*0.8));
        grad.addColorStop(1,'transparent');
        ctx.save(); ctx.scale(rx/max,ry/max);
        ctx.beginPath(); ctx.arc(cx*max/rx,cy*max/ry,max,0,Math.PI*2);
        ctx.fillStyle=grad; ctx.fill(); ctx.restore();
    });
}

function drawStars() {
    stars.forEach(s => {
        s.phase += s.speed;
        const twinkle = 0.5+0.5*Math.sin(s.phase);
        const a = s.alpha*(0.4+0.6*twinkle);
        if (s.r > 1.5) {
            const grd=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.r*5);
            grd.addColorStop(0,hexAlpha(s.color,a*0.6));
            grd.addColorStop(0.4,hexAlpha(s.color,a*0.15));
            grd.addColorStop(1,'transparent');
            ctx.beginPath(); ctx.arc(s.x,s.y,s.r*5,0,Math.PI*2);
            ctx.fillStyle=grd; ctx.fill();
            if (s.r>2.2) {
                ctx.save(); ctx.globalAlpha=a*0.4; ctx.strokeStyle=s.color; ctx.lineWidth=0.6;
                const fl=s.r*7;
                ctx.beginPath(); ctx.moveTo(s.x-fl,s.y); ctx.lineTo(s.x+fl,s.y); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(s.x,s.y-fl); ctx.lineTo(s.x,s.y+fl); ctx.stroke();
                ctx.restore();
            }
        }
        ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
        ctx.fillStyle=hexAlpha(s.color,a); ctx.fill();
    });
}

function drawShootingStars() {
    for (let i=shootingStars.length-1; i>=0; i--) {
        const s=shootingStars[i];
        s.x+=s.vx; s.y+=s.vy; s.life-=s.decay;
        if (s.life<=0) { shootingStars.splice(i,1); continue; }
        const spd=Math.hypot(s.vx,s.vy);
        const tailX=s.x-s.vx*(s.len/spd), tailY=s.y-s.vy*(s.len/spd);
        const grad=ctx.createLinearGradient(tailX,tailY,s.x,s.y);
        grad.addColorStop(0,'transparent');
        grad.addColorStop(0.6,hexAlpha('#c4a8ff',s.life*0.4));
        grad.addColorStop(1,hexAlpha('#ffffff',s.life));
        ctx.save(); ctx.lineWidth=s.width; ctx.strokeStyle=grad;
        ctx.shadowColor='#a78bfa'; ctx.shadowBlur=8;
        ctx.beginPath(); ctx.moveTo(tailX,tailY); ctx.lineTo(s.x,s.y); ctx.stroke(); ctx.restore();
    }
}

function drawParticleNetwork() {
    const LINK=140, MLINK=180;
    particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy;
        if(p.x<-10)p.x=W+10; if(p.x>W+10)p.x=-10;
        if(p.y<-10)p.y=H+10; if(p.y>H+10)p.y=-10;
    });
    for (let i=0;i<particles.length;i++) {
        for (let j=i+1;j<particles.length;j++) {
            const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
            const dist=Math.sqrt(dx*dx+dy*dy);
            if(dist<LINK){ ctx.save(); ctx.globalAlpha=(1-dist/LINK)*0.5; ctx.strokeStyle='#a78bfa'; ctx.lineWidth=0.7; ctx.shadowColor='#a78bfa'; ctx.shadowBlur=4; ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke(); ctx.restore(); }
        }
        const mdx=particles[i].x-mouse.x, mdy=particles[i].y-mouse.y;
        const md=Math.sqrt(mdx*mdx+mdy*mdy);
        if(md<MLINK){ ctx.save(); ctx.globalAlpha=(1-md/MLINK)*0.85; ctx.strokeStyle='#2dd4bf'; ctx.lineWidth=1; ctx.shadowColor='#2dd4bf'; ctx.shadowBlur=6; ctx.beginPath(); ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(mouse.x,mouse.y); ctx.stroke(); ctx.restore(); }
    }
    particles.forEach(p => {
        const grd=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);
        grd.addColorStop(0,hexAlpha('#a78bfa',p.alpha)); grd.addColorStop(0.5,hexAlpha('#a78bfa',p.alpha*0.3)); grd.addColorStop(1,'transparent');
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r*3,0,Math.PI*2); ctx.fillStyle=grd; ctx.fill();
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fillStyle=hexAlpha('#e0d4ff',p.alpha); ctx.fill();
    });
}

let frame=0;
function loop() {
    requestAnimationFrame(loop); frame++;
    ctx.fillStyle='#030810'; ctx.fillRect(0,0,W,H);
    drawBlobs(); drawStars(); drawShootingStars(); drawParticleNetwork();
    if(frame%280===0 && Math.random()>0.3) spawnShootingStar();
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', e => { mouse.x=e.clientX; mouse.y=e.clientY; });
resize(); loop();


/* ============================================================
   CUSTOM CURSOR
   ============================================================ */
const cursorDot     = document.querySelector('[data-cursor-dot]');
const cursorOutline = document.querySelector('[data-cursor-outline]');
window.addEventListener('mousemove', e => {
    cursorDot.style.left=`${e.clientX}px`; cursorDot.style.top=`${e.clientY}px`;
    cursorOutline.animate({left:`${e.clientX}px`,top:`${e.clientY}px`},{duration:400,fill:'forwards'});
});


/* ============================================================
   TYPEWRITER EFFECT — Hero name
   ============================================================ */
function typewriter(el, text, speed=70) {
    el.textContent=''; let i=0;
    const tick = () => { if(i<text.length){ el.textContent+=text[i++]; setTimeout(tick,speed); } };
    tick();
}
window.addEventListener('load', () => {
    const heroName = document.querySelector('.hero-name');
    if(heroName) { const fullText=heroName.textContent; typewriter(heroName, fullText, 70); }
});


/* ============================================================
   ANIMATED TYPING ROLE — cycling subtitle
   ============================================================ */
const roles = ['Electronics Engineer','IoT Developer','Embedded Systems Expert','Computer Vision Enthusiast'];
let roleIdx=0, charIdx=0, deleting=false;
const heroTitle = document.querySelector('.hero-title');
function cycleRole() {
    if(!heroTitle) return;
    const gradSpan = heroTitle.querySelector('.text-gradient');
    const label = roles[roleIdx];
    if(!deleting) {
        if(gradSpan) gradSpan.textContent = label.slice(0,++charIdx);
        if(charIdx===label.length){ deleting=true; setTimeout(cycleRole,2000); return; }
    } else {
        if(gradSpan) gradSpan.textContent = label.slice(0,--charIdx);
        if(charIdx===0){ deleting=false; roleIdx=(roleIdx+1)%roles.length; }
    }
    setTimeout(cycleRole, deleting?45:80);
}
window.addEventListener('load', () => setTimeout(cycleRole, 800));


/* ============================================================
   MOBILE MENU
   ============================================================ */
const menuIcon  = document.querySelector('#menu-icon');
const menuIconI = document.querySelector('#menu-icon i');
const navbar    = document.querySelector('.navbar');
menuIcon.onclick = () => {
    menuIconI.classList.toggle('fa-xmark');
    menuIconI.classList.toggle('fa-bars');
    navbar.classList.toggle('active');
};
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navbar.classList.remove('active');
        menuIconI.classList.add('fa-bars');
        menuIconI.classList.remove('fa-xmark');
    });
});


/* ============================================================
   STAGGERED SCROLL REVEAL
   ============================================================ */
const fadeStyle = document.createElement('style');
fadeStyle.innerHTML = `
    .reveal-item {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.7s cubic-bezier(.2,.9,.3,1), transform 0.7s cubic-bezier(.2,.9,.3,1);
    }
    .reveal-item.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .section-title {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    .section-title.visible { opacity: 1; transform: translateY(0); }

    /* Nav underline animation */
    .nav-link:not(.contact-btn)::after {
        content:''; position:absolute; bottom:-3px; left:0;
        width:0; height:2px;
        background: linear-gradient(to right,#a78bfa,#2dd4bf);
        border-radius:2px;
        transition: width 0.3s ease;
    }
    .nav-link:not(.contact-btn):hover::after { width:100%; }

    /* Skill tag hover glow */
    .skill-tag:hover {
        background: rgba(167,139,250,0.25) !important;
        color: #f2edff !important;
        box-shadow: 0 0 18px rgba(167,139,250,0.4);
        transform: translateY(-2px);
    }

    /* Project card icon pulse on hover */
    .project-icon { transition: all 0.4s ease; }
    .project-card:hover .project-icon {
        transform: scale(1.15) rotate(8deg);
        box-shadow: 0 0 25px rgba(167,139,250,0.5);
    }

    /* Focus card icon bounce */
    .focus-card:hover i {
        animation: iconBounce 0.6s cubic-bezier(.36,.07,.19,.97) both;
    }
    @keyframes iconBounce {
        0%,100%{transform:translateY(0)} 30%{transform:translateY(-10px)} 60%{transform:translateY(-4px)}
    }

    /* Timeline dot pulse */
    .timeline-dot {
        animation: dotPulse 2.5s ease-in-out infinite;
    }
    @keyframes dotPulse {
        0%,100%{ box-shadow: 0 0 8px rgba(167,139,250,0.4);}
        50%{ box-shadow: 0 0 22px rgba(167,139,250,0.9), 0 0 40px rgba(167,139,250,0.3);}
    }

    /* Hero buttons hover lift */
    .btn { transition: all 0.3s cubic-bezier(.2,.9,.3,1) !important; }
    .btn:hover { transform: translateY(-4px) scale(1.04) !important; }

    /* Cursor blink after typewriter */
    .hero-name::after {
        content:'|'; animation: blink 1s step-end infinite;
        color: #a78bfa; margin-left:2px;
    }
    @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
`;
document.head.appendChild(fadeStyle);

/* Attach reveal class to elements */
document.querySelectorAll('.about-card,.focus-card,.timeline-item,.skill-category,.project-card,.contact-item,.contact-form,.section-title').forEach((el,i) => {
    el.classList.add('reveal-item');
    el.style.transitionDelay = `${(i % 4) * 0.12}s`;
});

const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if(entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal-item').forEach(el => revealObserver.observe(el));


/* ============================================================
   3D CARD TILT on hover
   ============================================================ */
document.querySelectorAll('.project-card, .focus-card, .about-card').forEach(card => {
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = e.clientX - r.left, y = e.clientY - r.top;
        const cx = r.width/2, cy = r.height/2;
        const rotX = ((y-cy)/cy)*-8;
        const rotY = ((x-cx)/cx)*8;
        card.style.transform = `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
        card.style.transition = 'transform 0.1s ease';
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
        card.style.transition = 'transform 0.5s cubic-bezier(.2,.9,.3,1)';
    });
});


/* ============================================================
   HEADER scroll glass effect
   ============================================================ */
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if(window.scrollY > 50) {
        header.style.background = 'rgba(3,8,16,0.92)';
        header.style.boxShadow  = '0 2px 30px rgba(167,139,250,0.08)';
    } else {
        header.style.background = 'rgba(15,23,42,0.8)';
        header.style.boxShadow  = 'none';
    }
});
