import HomePage from '../pages/home/home-page';
import AboutPage from '../pages/about/about-page';
import SaveStoryPage from '../pages/story-tersimpan/story-tersimpan';
import LoginPage from '../pages/auth/login/login-page';
import { checkAuthenticatedRoute, checkUnauthenticatedRouteOnly } from '../utils/auth';
import RegisterPage from '../pages/auth/register/register-page';
import StoryDetailPage from '../pages/story-detail/story-detail-page';
import AddStoryPagePresenter from '../pages/add/add-story-page';

const routes = {
  '/': () => checkAuthenticatedRoute(new HomePage()),
  '/login': () => checkUnauthenticatedRouteOnly(new LoginPage()),
  '/register': () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  '/about': () => checkAuthenticatedRoute(new AboutPage()),
  '/savedstory': () => checkAuthenticatedRoute(new SaveStoryPage()),
  '/story/:id': () => checkAuthenticatedRoute(new StoryDetailPage()),
  '/new': () => checkAuthenticatedRoute(new AddStoryPagePresenter()),
};

export default routes;
