import Swal from 'sweetalert2';
import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import {
  generateAuthenticatedNavigationListTemplate,
  generateMainNavigationListTemplate,
  generateUnauthenticatedNavigationListTemplate,
  generateSubscribeButtonTemplate,
  generateUnsubscribeButtonTemplate,
  generateNotFound,
} from '../templates';
import { setupSkipToContent, transitionHelper, isServiceWorkerAvailable } from '../utils';
import { getAccessToken, getLogout } from '../utils/auth';
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from '../utils/notification-helper';
import notFoundPage from './not-found/not-found-page';

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
    this.#setupNavigationList();
    this._setupDrawer();

    if (isServiceWorkerAvailable()) {
      await this.#setupPushNotification();
    }

    await this.renderPage();
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

  async renderPage() {
    const activeRoute = getActiveRoute();
    const pageFactory = routes[activeRoute];

    if (!pageFactory) {
      this.#content.innerHTML = notFoundPage();
      return;
    }

    try {
      const page = pageFactory();
      if (!page) return; // Handle case when auth check fails

      const transition = transitionHelper({
        updateDOM: async () => {
          const content = await page.render();
          this.#content.innerHTML = content;
          await page.afterRender();
        },
      });

      transition.ready.catch(console.error);
      transition.updateCallbackDone.then(() => {
        scrollTo({ top: 0, behavior: 'instant' });
      });
    } catch (error) {
      console.error(error);
      this.#content.innerHTML = notFoundPage();
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

    // Check subscription status and update UI
    this.#isSubscribed = await isCurrentPushSubscriptionAvailable();
    await this.#updateSubscriptionUI(pushNotificationTools);
  }

  async #updateSubscriptionUI(pushNotificationTools) {
    // Clear existing content and event listeners
    pushNotificationTools.innerHTML = '';

    if (this.#isSubscribed) {
      pushNotificationTools.innerHTML = generateUnsubscribeButtonTemplate();
      const unsubscribeBtn = await this.#waitForElement('#unsubscribe-button');
      if (unsubscribeBtn) {
        unsubscribeBtn.addEventListener('click', async () => {
          await unsubscribe();
          this.#isSubscribed = false;
          await this.#updateSubscriptionUI(pushNotificationTools);
        });
      }
    } else {
      pushNotificationTools.innerHTML = generateSubscribeButtonTemplate();
      const subscribeBtn = await this.#waitForElement('#subscribe-button');
      if (subscribeBtn) {
        subscribeBtn.addEventListener('click', async () => {
          await subscribe();
          this.#isSubscribed = await isCurrentPushSubscriptionAvailable();
          await this.#updateSubscriptionUI(pushNotificationTools);
        });
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
