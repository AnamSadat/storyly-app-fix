import Swal from 'sweetalert2';
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
} from '../templates';
import { setupSkipToContent, transitionHelper, isServiceWorkerAvailable } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from '../utils/notification-helper';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #skipLinkButton;
  #isSubscribed = false;

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    this.#init();
  }

  async #init() {
    setupSkipToContent(this.#skipLinkButton);

    if (isServiceWorkerAvailable()) {
      await this.#setupPushNotification();
    }

    await this.renderPage();
    this.#setupNavigationList();
  }

  async renderPage() {
    const activeRoute = getActiveRoute();
    const pageFactory = routes[activeRoute];

    if (!pageFactory) {
      this.#content.innerHTML = '<h2>404 - Page not found</h2>';
      return;
    }

    try {
      const page = pageFactory();
      if (!page) return; // Handle case when auth check fails

      const content = await page.render();
      this.#content.innerHTML = content;
      await page.afterRender();
    } catch (error) {
      console.error(error);
      this.#content.innerHTML = '<h2>Error rendering page</h2>';
    }
  }

  async #waitForElement(selector, timeout = 2000) {
    return new Promise((resolve, reject) => {
      const start = Date.now();
      const interval = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          resolve(el);
        } else if (Date.now() - start > timeout) {
          clearInterval(interval);
          reject(new Error(`Timeout waiting for ${selector}`));
        }
      }, 50);
    });
  }

  async #setupPushNotification() {
    const pushNotificationTools = document.getElementById('push-notification-tools');
    if (!pushNotificationTools) return;

    // Check subscription status
    this.#isSubscribed = await isCurrentPushSubscriptionAvailable();
    this.#updateSubscriptionUI(pushNotificationTools);

    // Listen for hash changes to update subscription UI
    window.addEventListener('hashchange', () => {
      const pushTools = document.getElementById('push-notification-tools');
      if (pushTools) {
        this.#updateSubscriptionUI(pushTools);
      }
    });
  }

  async #updateSubscriptionUI(pushNotificationTools) {
    if (this.#isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      try {
        const unsubscribeBtn = await this.#waitForElement('#unsubscribe-button');
        unsubscribeBtn.addEventListener('click', async () => {
          await unsubscribe();
          this.#isSubscribed = false;
          this.#updateSubscriptionUI(pushNotificationTools);
        });
      } catch (err) {
        console.warn('unsubscribe-button not found after rendering!');
      }
    } else {
      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      try {
        const subscribeBtn = await this.#waitForElement('#subscribe-button');
        subscribeBtn.addEventListener('click', async () => {
          await subscribe();
          this.#isSubscribed = await isCurrentPushSubscriptionAvailable();
          this.#updateSubscriptionUI(pushNotificationTools);
        });
      } catch (err) {
        console.warn('subscribe-button not found after rendering!');
      }
    }
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem('navlist');

    if (!isLogin) {
      navList.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateAuthenticatedNavigationListTemplate();

    const logoutButton = document.getElementById('logout-button');
    logoutButton.addEventListener('click', (event) => {
      event.preventDefault();

      Swal.fire({
        title: 'Are you sure?',
        text: 'Are you really want to Logout ?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, Logout!',
      }).then((result) => {
        if (result.isConfirmed) {
          getLogout();
          location.hash = '/login';
        }
      });
    });
  }
}

export default App;
