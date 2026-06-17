import { Component } from '@angular/core';

@Component({
    selector: 'app-logo',
    standalone: true,
    template: `
    <div class="d-flex align-items-center">
     <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <style>
                    @keyframes steam {
                        0% {
                            transform: translateY(0) scaleY(1);
                            opacity: 0;
                        }

                        50% {
                            transform: translateY(-10px) scaleY(1.2);
                            opacity: 0.8;
                        }

                        100% {
                            transform: translateY(-20px) scaleY(1.5);
                            opacity: 0;
                        }
                    }

                    .steam-line {
                        animation: steam 2s infinite ease-in-out;
                    }

                    .steam-line:nth-child(2) {
                        animation-delay: 0.5s;
                    }

                    .steam-line:nth-child(3) {
                        animation-delay: 1s;
                    }
                </style>

                <!-- البخار المتصاعد -->
                <path class="steam-line" d="M24 15 Q24 5 28 5" stroke="#0d9488" stroke-width="2"
                    stroke-linecap="round" />
                <path class="steam-line" d="M32 15 Q32 5 36 5" stroke="#0d9488" stroke-width="2"
                    stroke-linecap="round" />
                <path class="steam-line" d="M40 15 Q40 5 44 5" stroke="#0d9488" stroke-width="2"
                    stroke-linecap="round" />

                <!-- جسم القدر -->
                <path d="M14 24H50V44C50 48.4 46.4 52 42 52H22C17.6 52 14 48.4 14 44V24Z" fill="#1e293b" />
                <!-- حافة القدر -->
                <path d="M10 24H54" stroke="#1e293b" stroke-width="4" stroke-linecap="round" />
                <!-- اليد -->
                <path d="M26 24C26 18 38 18 38 24" fill="none" stroke="#0d9488" stroke-width="3" />
            </svg>
             <h3 class="fw-bold text-dark m-0">Rezeptbuch</h3>
    </div>
  `
})
export class LogoComponent { }