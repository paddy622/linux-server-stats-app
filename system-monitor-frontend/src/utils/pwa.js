// PWA utilities for installation and service worker management

export const isStandalone = () => {
    return window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone ||
        document.referrer.includes('android-app://');
};

export const canInstall = () => {
    return 'serviceWorker' in navigator && 'BeforeInstallPromptEvent' in window;
};

// Service Worker Registration
export const registerSW = () => {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);

                    // Check for updates
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New content is available
                                console.log('New content is available; please refresh.');
                                // You could show a notification here
                            }
                        });
                    });
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
};

// Install Prompt Management
class PWAInstaller {
    constructor() {
        this.deferredPrompt = null;
        this.setupInstallPrompt();
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
        });

        window.addEventListener('appinstalled', (evt) => {
            console.log('App was installed');
            this.deferredPrompt = null;
        });
    }

    async showInstallPrompt() {
        if (!this.deferredPrompt) {
            console.log('No install prompt available');
            return false;
        }

        // Show the install prompt
        this.deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await this.deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // Clear the deferredPrompt
        this.deferredPrompt = null;

        return outcome === 'accepted';
    }

    canShowInstallPrompt() {
        return this.deferredPrompt !== null;
    }
}

export const pwaInstaller = new PWAInstaller();

// Check if app is installed
export const isAppInstalled = () => {
    // Check if running in standalone mode
    if (isStandalone()) {
        return true;
    }

    // Check if app is installed via other means
    if (navigator.getInstalledRelatedApps) {
        return navigator.getInstalledRelatedApps().then(apps => apps.length > 0);
    }

    return false;
};

// Utility to add install banner/button
export const createInstallBanner = () => {
    if (pwaInstaller.canShowInstallPrompt() && !isStandalone()) {
        return {
            show: true,
            install: () => pwaInstaller.showInstallPrompt()
        };
    }
    return { show: false };
};

// Android-specific utilities
export const isAndroid = () => {
    return /Android/i.test(navigator.userAgent);
};

export const isChrome = () => {
    return /Chrome/i.test(navigator.userAgent) && !/Edge/i.test(navigator.userAgent);
};

export const canInstallOnAndroid = () => {
    return isAndroid() && isChrome() && !isStandalone();
};
