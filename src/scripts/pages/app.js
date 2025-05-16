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

  constructor({ navigationDrawer, drawerButton, content, skipLinkButton }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#skipLinkButton = skipLinkButton;

    // this._setupDrawer();
    this.#init();
  }

  #init() {
    setupSkipToContent(this.#skipLinkButton, this.#content);
    this._setupDrawer();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
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

    const isSubscribed = await isCurrentPushSubscriptionAvailable();

    if (isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();

      try {
        const unsubscribee = await this.#waitForElement('#unsubscribe-button');
        unsubscribee.addEventListener('click', () => {
          unsubscribe().finally(() => this.#setupPushNotification());
        });
      } catch (err) {
        console.warn('unsubscribe-button not found after rendering!');
      }

      return;
    }

    pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();

    try {
      const subscribeButton = await this.#waitForElement('#subscribe-button');
      subscribeButton.addEventListener('click', () => {
        subscribe().finally(() => this.#setupPushNotification());
      });
    } catch (err) {
      console.warn('subscribe-button not found after rendering!');
    }
  }

  #setupNavigationList() {
    const isLogin = !!getAccessToken();
    const navList = this.#navigationDrawer.children.namedItem('navlist');

    // User not log in
    if (!isLogin) {
      navList.innerHTML = '';
      navList.innerHTML = generateUnauthenticatedNavigationListTemplate();
      return;
    }

    navList.innerHTML = generateMainNavigationListTemplate();

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

  async renderPage() {
    const url = getActiveRoute();
    const route = routes[url];

    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.ready.catch(console.error);
    transition.updateCallbackDone.then(() => {
      scrollTo({ top: 0, behavior: 'instant' });
      this.#setupNavigationList();

      if (isServiceWorkerAvailable()) {
        setTimeout(() => this.#setupPushNotification(), 0);
      }
    });
  }
}

export default App;
