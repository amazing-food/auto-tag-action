import * as core from '@actions/core'
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    const token = core.getInput('token', {required: true})
    const name = core.getInput('name')
    const git = github.getOctokit(token)
    const tags = await git.rest.repos.listTags({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      per_page: 10
    })

    const map = tags.data
      .filter(s => !isNaN(parseInt(s.name)))
      .sort((a, b) => parseInt(b.name) - parseInt(a.name))
    const latest = map[0].commit.sha
    const commits = await git.rest.repos.compareCommits({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      base: latest,
      head: 'master'
    })

    await git.rest.repos.createRelease({
      name: `Auto release ${name}`,
      draft: false,
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      tag_name: name,
      body: commits.data.commits
        .filter(c => c.commit.committer?.email === 'noreply@github.com')
        .map(c => `* ${c.sha} ${c.commit.message}`)
        .join('\n')
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
