
$(document).ready(function() {
  $(window).scroll(function() {
    // sticky navbar on scroll script
    if (this.scrollY > 20) {
      $('.navbar').addClass("sticky");
    } else {
      $('.navbar').removeClass("sticky");
    }

    // scroll-up button show/hide script
    if (this.scrollY > 500) {
      $('.scroll-up-btn').addClass("show");
    } else {
      $('.scroll-up-btn').removeClass("show");
    }
  });

  // slide-up script
  $('.scroll-up-btn').click(function() {
    $('html').animate({ scrollTop: 0 });
    // removing smooth scroll on slide-up button click
    $('html').css("scrollBehavior", "auto");
  });

  $('.navbar .menu li a').click(function() {
    // applying again smooth scroll on menu items click
    $('html').css("scrollBehavior", "smooth");
  });

  // toggle menu/navbar script
  $('.menu-btn').click(function() {
    $('.navbar .menu').toggleClass("active");
    $('.menu-btn i').toggleClass("active");
  });

  // typing text animation script
  var typed = new Typed(".typing", {
    strings: ["YouTuber", "Developer", "Blogger", "Designer", "Student"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true
  });

  var typed = new Typed(".typing-2", {
    strings: ["YouTuber", "Developer", "Blogger", "Designer", "Student"],
    typeSpeed: 100,
    backSpeed: 60,
    loop: true
  });

  // owl carousel script
  $('.carousel').owlCarousel({
    margin: 20,
    loop: true,
    autoplayTimeOut: 2000,
    autoplayHoverPause: true,
    responsive: {
      0: {
        items: 1,
        nav: false
      },
      600: {
        items: 2,
        nav: false
      },
      1000: {
        items: 3,
        nav: false
      }
    }
  });
});
const canvas = document.querySelector('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

// Constants
const DENSITY = 200;
const VELOCITY = 0.5;
const MAX_DISTANCE = 100;
const MAX_CONNECTIONS = 10;

const light = new window.illuminated.Lamp({
  position: new window.illuminated.Vec2(0, 0),
  distance: (document.body.offsetWidth + document.body.offsetHeight) / 2,
  diffuse: 1,
  color: 'rgba(120,100,200,0.2)',
  radius: 5,
  samples: 0,
});

const mask = new window.illuminated.DarkMask({ lights: [light], color: 'rgba(0,0,0,0.75)' });

// Capture mouse movement
let mouseX = 0, mouseY = 0;
canvas.addEventListener('mousemove', e => {
  mouseX = e.x;
  mouseY = e.y;
  light.position = new window.illuminated.Vec2(mouseX, mouseY);
});

// Clamp n between min and max
function clamp(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n;
}

const startingPoints = new Array(DENSITY)
  .fill(null)
  .map(_ => [
    // x
    Math.random() * document.body.offsetWidth,
    // y
    Math.random() * document.body.offsetHeight,
    // direction x
    Math.random() < 0.5 ? -1 : 1,
    // direction y
    Math.random() < 0.5 ? -1 : 1,
    // color r
    clamp(Math.random() + 0.2, 0.2, 0.6),
    // color g
    clamp(Math.random() + 0.2, 0.2, 0.6),
    // color b
    clamp(Math.random() + 0.2, 0.2, 0.6),
  ])
  .map(([x, y, dx, dy, cr, cg, cb]) => [~~x, ~~y, dx, dy, cr, cg, cb]);

const lighting = new window.illuminated.Lighting({ light, objects: [] });

let connectBlacklist = [];

function update() {

  // Reset blacklist
  connectBlacklist = [];

  // Iterate over nodes
  for (const p of startingPoints) {

    let [oldx, oldy] = p;

    // Update position
    p[0] += Math.random() * VELOCITY * p[2];
    p[1] += Math.random() * VELOCITY * p[3];

    // Destructure node
    let [x, y] = p;

    // Boundary check X
    if (x < 0 || x > document.body.offsetWidth) {
      p[2] *= -1;
    }

    // Boundary check Y
    if (y < 0 || y > document.body.offsetHeight) {
      p[3] *= -1;
    }

    // Mouse collision
    const dist = 50;
    if (
      (Math.abs(mouseX - x) < dist || Math.abs(x - mouseX) < dist) &&
      (Math.abs(mouseY - y) < dist || Math.abs(y - mouseY) < dist)
    ) {
      p[0] += VELOCITY * p[2] * 10;
      p[1] += VELOCITY * p[3] * 10;
    }
  }
}

function drawPoint([x, y]) {
  ctx.beginPath();
  ctx.arc(x, y, 2, 0, 2 * Math.PI, false);
  ctx.fillStyle = 'white';
  ctx.fill();
}

function connectPoint(thisp, dist) {
  let n = 0;
  let strength = 0;
  const [x, y, dx, dy, cr, cg, cb] = thisp;
  connectBlacklist.push(thisp);

  // Iterate over points
  for (const p of startingPoints) {

    // Destructure node
    const [px, py] = p;

    // Validate move
    if (n > MAX_CONNECTIONS) return;
    if (connectBlacklist.includes(p)) continue;

    // Validate distance
    if (Math.abs(x - px) < dist && Math.abs(y - py) < dist) {

      // Calculate connection strength
      strength += (Math.abs(x - px) + Math.abs(y - py)) / 2;
      let avg = clamp(strength / (n + 1), 0, MAX_DISTANCE * 2);
      let fac = (avg / MAX_DISTANCE) * 255;

      // Calculate color from connection strength
      let r = clamp(fac * cr, 0, 125);
      let g = clamp(fac * cg, 0, 125);
      let b = clamp(fac * cb, 0, 125);
      let a = clamp(avg / (MAX_DISTANCE * 0.75), .3, .9);
      let color = `rgba(${r},${r},${g},${a})`;

      // Draw line
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(px, py);
      ctx.strokeStyle = color;
      ctx.stroke();

      // Increment node count
      n += 1;

      // Add node to blacklist
      connectBlacklist.push(p);
    }
  }
}
