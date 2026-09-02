export const INCIDENT_PAGE_SIZE = 25;
export const JOB_PAGE_SIZE = 25;

export function buildIncidentsQuery({
  page = 1,
  limit = INCIDENT_PAGE_SIZE,
  source = 'all',
  severity = 'all',
  includeResolved = false,
  refresh = false
} = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (source !== 'all') params.set('source', source);
  if (severity !== 'all') params.set('severity', severity);
  if (includeResolved) params.set('includeResolved', 'true');
  if (refresh) params.set('refresh', 'true');
  return params.toString();
}

export function buildJobsQuery({
  page = 1,
  limit = JOB_PAGE_SIZE,
  search = '',
  status = 'all',
  jobType = 'all',
  failedOnly = false,
  stuckOnly = false
} = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (search.trim()) params.set('search', search.trim());
  if (status !== 'all' && !failedOnly && !stuckOnly) params.set('status', status);
  if (jobType !== 'all') params.set('jobType', jobType);
  if (failedOnly) params.set('failedOnly', 'true');
  if (stuckOnly) params.set('stuckOnly', 'true');
  return params.toString();
}

function formatTimestamp(value) {
  const timestamp = new Date(value);
  return Number.isNaN(timestamp.getTime()) ? String(value || 'Unknown') : timestamp.toISOString();
}

export function formatCodexBrief(incidents = []) {
  if (!Array.isArray(incidents) || incidents.length === 0) return '';
  return incidents.map((incident, index) => [
    `Incident ${index + 1}`,
    `Source: ${incident.sourceGroup === 'cost_alert' ? 'Cost · Alert' : incident.source === 'job' ? 'Job' : 'Sentry'}`,
    `Severity: ${String(incident.severity || 'unknown').toUpperCase()}`,
    `Status: ${String(incident.status || 'open').replaceAll('_', ' ')}`,
    `Title: ${incident.title || 'Untitled incident'}`,
    `Details: ${incident.message || 'No additional details.'}`,
    `Timestamp: ${formatTimestamp(incident.createdAt)}`,
    `Reference: ${incident.id || `${incident.source}:${incident.sourceId}`}`
  ].join('\n')).join('\n\n');
}

export function selectedIncidents(incidents = [], selection = new Set()) {
  if (!(selection instanceof Set) || selection.size === 0) return [];
  return incidents.filter((incident) => selection.has(incident.id));
}

export function optimisticIncidentTransition({ incidents, ids, status, includeResolved, openCount }) {
  const selected = new Set(ids);
  let delta = 0;
  const transitioned = incidents.map((incident) => {
    if (!selected.has(incident.id) || incident.status === status) return incident;
    if (incident.status === 'resolved' && status !== 'resolved') delta += 1;
    if (incident.status !== 'resolved' && status === 'resolved') delta -= 1;
    return { ...incident, status, resolved: status === 'resolved' };
  });
  return {
    incidents: includeResolved ? transitioned : transitioned.filter((incident) => incident.status !== 'resolved'),
    openCount: Math.max(0, Number(openCount || 0) + delta)
  };
}
