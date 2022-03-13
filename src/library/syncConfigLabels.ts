//  Library
import * as core from '@actions/core'
import * as github from '@actions/github'
import * as fs from 'node:fs'
import * as yaml from 'js-yaml'

//  Helpers
import * as config from '../config'
import { getRepoLabels } from './getRepoLabels'
import { createArtifacts } from './artifacts'

//  Type Definitions
import { GitHubLabel } from '../types'

/** Reads the repository-labels and updates the label-sync config-file */
export async function syncConfigLabels() {

    /** Repository's existing labels */
    const repoLabels = await getRepoLabels()

    //  Get the webhook event action and the modified label
    let { payload: { action, label } } = github.context

    //  Only keep the label properties that are needed, discard the rest
    label = {
        name: label.name,
        description: label.description,
        color: label.color
    }

    //  Modify repo-labels depending on what changed
    if (action === 'created' && !repoLabels.has(label.name)) {  //  New label created
        repoLabels.set(label.name, label)
    } else if (action === 'updated' && repoLabels.has(label.name)) {    //  Existing label updated
        repoLabels.set(label.name, label)
    } else if (action === 'deleted' && repoLabels.has(label.name)) {    //  Existing label deleted
        repoLabels.delete(label.name)
    }

    //  YAMLify repo-labels
    let labels: GitHubLabel[] = []
    repoLabels.forEach((label) => labels.push(label))
    let content = yaml.dump(labels)
    content = content.replace(/(\s+-\s+\w+:.*)/g, '\n$1').trimStart()   //  Add additional \n for clarity sake

    //  Log and exit if Dry-Run Mode
    if (config.isDryRun) {
        core.warning('\u001b[33;1mNOTE: This is a dry run\u001b[0m')
        core.info(content)
        if (config.createArtifact) {
            core.info('Creating artifacts')
        }
        return
    }

    //  Write yaml configuration to the workspace
    fs.writeFileSync(config.workspacePath, content, { encoding: 'utf-8' })

    //  Generate artifacts of the updated label config
    if (config.createArtifact) {
        createArtifacts('labels', [`./${config.path}`])
        core.notice(`Created artifacts containing ${config.path}`)
    }

}