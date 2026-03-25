const normalizeUrl = (value) => value?.replace(/\/+$/, '') || ''

export function getClientAppUrl(path = '') {
    const baseUrl = normalizeUrl(import.meta.env.VITE_CLIENT_APP_URL) || window.location.origin
    return `${baseUrl}${path}`
}

export function getMentorAppUrl(path = '') {
    const baseUrl = normalizeUrl(import.meta.env.VITE_MENTOR_APP_URL) || window.location.origin
    return `${baseUrl}${path}`
}

export function getAppUrlForRole(role = 'client', path = '') {
    return role === 'mentor' ? getMentorAppUrl(path) : getClientAppUrl(path)
}
