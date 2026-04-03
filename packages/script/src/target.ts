const raw = {
  domain: "__KEEL_TARGET_DOMAIN__",
  repo: "__KEEL_TARGET_GITHUB_REPO__",
  scope: "__KEEL_TARGET_NPM_SCOPE__",
  main: "__KEEL_TARGET_NPM_MAIN_PACKAGE__",
  image: "__KEEL_TARGET_GHCR_IMAGE__",
  tap: "__KEEL_TARGET_HOMEBREW_TAP_REPO__",
} as const

function web(path = "") {
  return `https://${raw.domain}${path}`
}

function git(path = "") {
  return `https://github.com/${raw.repo}${path}`
}

function api(path = "") {
  return `https://api.github.com/repos/${raw.repo}${path}`
}

function npm(tag?: string) {
  return `https://registry.npmjs.org/${raw.main}${tag ? `/${tag}` : ""}`
}

function release(tag: string, file?: string) {
  if (file) return git(`/releases/download/${tag}/${file}`)
  return git(`/releases/tag/${tag}`)
}

function latest(file?: string) {
  if (file) return git(`/releases/latest/download/${file}`)
  return api("/releases/latest")
}

function clone(repo: string, token: string) {
  return `https://x-access-token:${token}@github.com/${repo}.git`
}

export const Target = {
  ...raw,
  api,
  clone,
  git,
  latest,
  npm,
  release,
  web,
}
