//Initialize sudoku.js
import { renderGameGrid } from './sudoku.js';

//Registration of PWA Service Worker
/*
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/serviceworker.js')
      .then(registration => {
        console.log('✅ Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });
}*/
