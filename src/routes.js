import Home from './pages/Home.svelte';
import Documents from './pages/Documents.svelte';
import Exams from './pages/Exams.svelte';
import Flashcards from './pages/Flashcards.svelte';
import Settings from './pages/Settings.svelte';
import AdminDashboard from './components/AdminDashboard.svelte';
import DocumentView from './pages/DocumentView.svelte';

export const DEFAULT_AUTH_PATH = '/dashboard';

const LEGACY_REDIRECTS = new Map([
  ['/app', DEFAULT_AUTH_PATH],
  ['/app/', DEFAULT_AUTH_PATH]
]);

export const STATIC_ROUTES = [
  {
    id: 'dashboard',
    path: '/dashboard',
    component: Home,
    labelKey: 'nav.dashboard',
    pageTitleKey: 'nav.dashboard',
    icon: 'dashboard',
    showInSidebar: true,
    showInBottomNav: true
  },
  {
    id: 'documents',
    path: '/documents',
    component: Documents,
    labelKey: 'nav.documents',
    pageTitleKey: 'nav.documents',
    icon: 'documents',
    showInSidebar: true,
    showInBottomNav: true
  },
  {
    id: 'exams',
    path: '/exams',
    component: Exams,
    labelKey: 'nav.exams',
    pageTitleKey: 'nav.exams',
    icon: 'exams',
    showInSidebar: true,
    showInBottomNav: true,
    comingSoon: true
  },
  {
    id: 'flashcards',
    path: '/flashcards',
    component: Flashcards,
    labelKey: 'nav.flashcards',
    pageTitleKey: 'nav.flashcards',
    icon: 'flashcards',
    showInSidebar: true,
    showInBottomNav: true,
    comingSoon: true
  },
  {
    id: 'settings',
    path: '/settings',
    component: Settings,
    labelKey: 'nav.settings',
    pageTitleKey: 'nav.settings',
    icon: 'settings',
    showInSidebar: true,
    showInBottomNav: true
  },
  {
    id: 'admin',
    path: '/admin',
    component: AdminDashboard,
    labelKey: 'nav.adminPanel',
    pageTitleKey: 'nav.adminPanel',
    icon: 'admin',
    showInSidebar: true,
    showInBottomNav: false,
    requiresAdmin: true
  }
];

const STATIC_ROUTE_MAP = new Map(STATIC_ROUTES.map((route) => [route.path, route]));

const DOCUMENT_ROUTE = {
  id: 'documents-detail',
  parentNavId: 'documents',
  path: '/document/:id',
  component: DocumentView,
  pageTitleKey: 'nav.documents',
  match(path) {
    if (!path.startsWith('/document/')) {
      return null;
    }

    const documentId = path.slice('/document/'.length);
    if (!documentId) {
      return null;
    }

    return { params: { documentId } };
  }
};

export const DYNAMIC_ROUTES = [DOCUMENT_ROUTE];

export function normalizeAppPath(path = '/') {
  if (!path) return '/';
  const trimmed = path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path;
  return LEGACY_REDIRECTS.get(trimmed) ?? trimmed;
}

export function resolveRoute(path) {
  const normalized = normalizeAppPath(path);
  const staticRoute = STATIC_ROUTE_MAP.get(normalized);
  if (staticRoute) {
    return { route: staticRoute, params: {} };
  }

  for (const dynamicRoute of DYNAMIC_ROUTES) {
    const match = dynamicRoute.match?.(normalized);
    if (match) {
      return { route: dynamicRoute, params: match.params ?? {} };
    }
  }

  return null;
}

export function getNavRoutes({ includeAdmin } = {}) {
  return STATIC_ROUTES.filter((route) => {
    if (!route.showInSidebar) return false;
    if (route.requiresAdmin && !includeAdmin) return false;
    return true;
  });
}

export function getBottomNavRoutes({ includeAdmin } = {}) {
  return STATIC_ROUTES.filter((route) => {
    if (!route.showInBottomNav) return false;
    if (route.requiresAdmin && !includeAdmin) return false;
    return true;
  });
}

export function getRouteByPath(path) {
  return STATIC_ROUTE_MAP.get(normalizeAppPath(path));
}

export function needsAdminAccess(route) {
  return !!route?.requiresAdmin;
}

export function getNavIdForRoute(route) {
  if (!route) return '';
  if (route.parentNavId) return route.parentNavId;
  return route.id ?? '';
}
