#!/usr/bin/env bun

import { Script } from "@keel-ai/script"
import { Target } from "@keel-ai/script/target"
import { $ } from "bun"

const output = [`version=${Script.version}`]
const repo = process.env.GH_REPO ?? Target.repo

if (!Script.preview) {
  const sha = process.env.GITHUB_SHA ?? (await $`git rev-parse HEAD`.text()).trim()
  await $`bun script/changelog.ts --to ${sha}`.cwd(process.cwd())
  const file = `${process.cwd()}/UPCOMING_CHANGELOG.md`
  const body = await Bun.file(file)
    .text()
    .catch(() => "No notable changes")
  const dir = process.env.RUNNER_TEMP ?? "/tmp"
  const notesFile = `${dir}/keel-release-notes.txt`
  await Bun.write(notesFile, body)
  await $`gh release create v${Script.version} -d --title "v${Script.version}" --notes-file ${notesFile} --repo ${repo}`
  const release = await $`gh release view v${Script.version} --json tagName,databaseId --repo ${repo}`.json()
  output.push(`release=${release.databaseId}`)
  output.push(`tag=${release.tagName}`)
} else if (Script.channel === "beta") {
  await $`gh release create v${Script.version} -d --title "v${Script.version}" --repo ${repo}`
  const release = await $`gh release view v${Script.version} --json tagName,databaseId --repo ${repo}`.json()
  output.push(`release=${release.databaseId}`)
  output.push(`tag=${release.tagName}`)
}

output.push(`repo=${repo}`)

if (process.env.GITHUB_OUTPUT) {
  await Bun.write(process.env.GITHUB_OUTPUT, output.join("\n"))
}

process.exit(0)
