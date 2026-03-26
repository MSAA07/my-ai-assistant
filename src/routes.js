import Home from './pages/Home.svelte';
import Settings from './pages/Settings.svelte';
import AdminDashboard from './components/AdminDashboard.svelte';
import DocumentView from './pages/DocumentView.svelte';
import StudyHubIndex from './pages/StudyHubIndex.svelte';
import StudyHubDocument from './pages/StudyHubDocument.svelte';

export const DEFAULT_AUTH_PATH = '/home';

const LEGACY_REDIRECTS = new Map([
  ['/app', DEFAULT_AUTH_PATH],
  ['/app/', DEFAULT_AUTH_PATH],
  ['/dashboard', DEFAULT_AUTH_PATH],
  ['/dashboard/', DEFAULT_AUTH_PATH],
  ['/upload', DEFAULT_AUTH_PATH],
  ['/documents', '/study'],
  ['/documents/', '/study'],
  ['/exams', '/study'],
  ['/flashcards', '/study'],
  ['/summary', '/study']
]);

const LEGACY_DOCUMENT_SECTION_MAP = {
  summary: 'summary',
  flashcards: 'flashcards',
  exam: 'exam',
  exams: 'exam',
  exports: 'exports',
  notes: 'summary',
  activity: 'summary'
};

export const STATIC_ROUTES = [
  {
    id: 'home',
    path: '/home',
    component: Home,
    labelKey: 'nav.home',
    pageTitleKey: 'nav.home',
    icon: 'dashboard',
    showInSidebar: true,
    showInBottomNav: true
  },
  {
    id: 'study',
    path: '/study',
    component: StudyHubIndex,
    labelKey: 'nav.study',
    pageTitleKey: 'nav.study',
    icon: 'documents',
    showInSidebar: true,
    showInBottomNav: true
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

const STUDY_ROUTE = {
  id: 'study-detail',
  parentNavId: 'study',
  path: '/study/:id/:section?',
  component: StudyHubDocument,
  pageTitleKey: 'nav.studyDetail',
  match(path) {
    if (!path.startsWith('/study/')) {
      return null;
    }

    const segments = path.split('/').filter(Boolean);
    if (segments.length < 2 || segments.length > 3) {
      return null;
    }

    const documentId = segments[1];
    if (!documentId) {
      return null;
    }

    const requestedSection = segments[2] ? segments[2].toLowerCase() : '';
    const allowedSections = new Set(['summary', 'flashcards', 'exam', 'exams', 'exports']);
    if (requestedSection && !allowedSections.has(requestedSection)) {
      return { params: { documentId, studyTab: '' } };
    }

    return { params: { documentId, studyTab: requestedSection } };
  }
};

const DOCUMENT_ROUTE = {
  id: 'documents-detail',
  parentNavId: 'study',
  path: '/legacy/documents/:id/:section?',
  component: DocumentView,
  pageTitleKey: 'nav.study',
  match(path) {
    const isLegacyPath = path.startsWith('/legacy/documents/') || path.startsWith('/documents-legacy/');
    if (!isLegacyPath) {
      return null;
    }

    const segments = path.split('/').filter(Boolean);
    if (segments.length < 3) {
      return null;
    }

    const documentId = segments[2];
    if (!documentId) {
      return null;
    }

    const section = (segments[3] ?? 'summary').toLowerCase();
    const validSections = new Set(['summary', 'flashcards', 'exam', 'notes', 'activity']);
    if (!validSections.has(section)) {
      return null;
    }

    return { params: { documentId, documentSection: section } };
  }
};

const ADMIN_WILDCARD_ROUTE = {
  id: 'admin-wildcard',
  parentNavId: 'admin',
  path: '/admin/*',
  component: AdminDashboard,
  pageTitleKey: 'nav.adminPanel',
  requiresAdmin: true,
  match(path) {
    if (!path.startsWith('/admin/')) return null;
    return { params: { adminPath: path.slice('/admin/'.length) } };
  }
};

export const DYNAMIC_ROUTES = [STUDY_ROUTE, DOCUMENT_ROUTE, ADMIN_WILDCARD_ROUTE];

export function normalizeAppPath(path = '/') {
  if (!path) return '/';
  if (path.startsWith('/document/')) {
    const documentId = path.slice('/document/'.length);
    return documentId ? `/study/${documentId}` : '/study';
  }
  if (path.startsWith('/documents/')) {
    const segments = path.split('/').filter(Boolean);
    const documentId = segments[1];
    if (!documentId) {
      return '/study';
    }

    const section = (segments[2] ?? 'summary').toLowerCase();
    const mappedSection = LEGACY_DOCUMENT_SECTION_MAP[section] ?? 'summary';
    return `/study/${documentId}/${mappedSection}`;
  }
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
