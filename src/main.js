import './style.css'
import javascriptLogo from './assets/javascript.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import { setupCounter } from './counter.js'

const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('btn-logout');

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let isRunning = false;

loginForm.addEventListener('submit', async(e) => {
    e.preventDefault();
    loginError.classList.add('hidden');

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const credentialsObject = {
        username: username,
        password: password
    }

    try {
        const response = await fetch('http://localhost:8080/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentialsObject),
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const responseData = await response.text();
            showGameDashboard();
        } else {
            loginError.classList.remove('hidden');
        }
    } catch (error) {
        console.error("Connection failed:", error);
        loginError.classList.remove('hidden');
    }
});

function showGameDashboard() {
    console.log("Attempting UI switch...");
    console.log("Login Element:", loginContainer);
    console.log("App Element:", appContainer);
    loginContainer.classList.add('hidden');
    appContainer.classList.remove('hidden');

    resizeCanvas();

    window.addEventListener('resize', resizeCanvas);

    isRunning = true;
    requestAnimationFrame(renderLoop);
}

function resizeCanvas() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function renderLoop() {
    if (!isRunning) return;
    ctx.clearRect(0,0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height /2, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();

    requestAnimationFrame(renderLoop);
}

logoutBtn.addEventListener('click', () => {
    isRunning = false;
    appContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
    loginForm.reset();
})

//
//document.querySelector('#app').innerHTML = `
//<section id="center">
//  <div class="hero">
//    <img src="${heroImg}" class="base" width="170" height="179">
//    <img src="${javascriptLogo}" class="framework" alt="JavaScript logo"/>
//    <img src="${viteLogo}" class="vite" alt="Vite logo" />
//  </div>
//  <div>
//    <h1>Get started</h1>
//    <p>Edit <code>src/main.js</code> and save to test <code>HMR</code></p>
//  </div>
//  <button id="counter" type="button" class="counter"></button>
//</section>
//
//<div class="ticks"></div>
//
//<section id="next-steps">
//  <div id="docs">
//    <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#documentation-icon"></use></svg>
//    <h2>Documentation</h2>
//    <p>Your questions, answered</p>
//    <ul>
//      <li>
//        <a href="https://vite.dev/" target="_blank">
//          <img class="logo" src="${viteLogo}" alt="" />
//          Explore Vite
//        </a>
//      </li>
//      <li>
//        <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//          <img class="button-icon" src="${javascriptLogo}" alt="">
//          Learn more
//        </a>
//      </li>
//    </ul>
//  </div>
//  <div id="social">
//    <svg class="icon" role="presentation" aria-hidden="true"><use href="/icons.svg#social-icon"></use></svg>
//    <h2>Connect with us</h2>
//    <p>Join the Vite community</p>
//    <ul>
//      <li><a href="https://github.com/vitejs/vite" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#github-icon"></use></svg>GitHub</a></li>
//      <li><a href="https://chat.vite.dev/" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#discord-icon"></use></svg>Discord</a></li>
//      <li><a href="https://x.com/vite_js" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#x-icon"></use></svg>X.com</a></li>
//      <li><a href="https://bsky.app/profile/vite.dev" target="_blank"><svg class="button-icon" role="presentation" aria-hidden="true"><use href="/icons.svg#bluesky-icon"></use></svg>Bluesky</a></li>
//    </ul>
//  </div>
//</section>
//
//<div class="ticks"></div>
//<section id="spacer"></section>
//`
//
//setupCounter(document.querySelector('#counter'))
