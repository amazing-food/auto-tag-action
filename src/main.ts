import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    const name = core.getInput('name')
    const git = github.getOctokit(token)

    await git.rest.repos.createRelease({
      name: `Auto release ${name}`,
      draft: false,
      generate_release_notes: true,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tag_name: name
    })
  } catch (error) {
    if (error instanceof Error) {
      core.setFailed(`Process failed with ${error.message}`)
    } else {
      core.setFailed(`Process failed with ${error}`)
    }
  }
}

run()
