import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login/login-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';
import RegisterPage from '../pages/auth/register/register-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import NewPage from '../pages/new/new-page';

const routes = {
  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  // '/about': new AboutPage(),
  '/story/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
  '/new': () => checkAuthenticatedRoute(new NewPage()),
};

export default routes;
