import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const removePreloader = () => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        preloader.style.transition = 'opacity 2s ease 0.8s, height 2s ease 0.8s';
        preloader.style.opacity = '0';
        preloader.style.height = '0';
        setTimeout(() => {
            preloader.remove();
        }, 3000); // Match the transition duration
    }
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
removePreloader();