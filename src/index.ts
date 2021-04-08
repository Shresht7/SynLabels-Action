import * as core from '@actions/core'
import * as github from '@actions/github'
import { GitHub } from '@actions/github/lib/utils'

import { getLabels, readLabels } from './utils'

//  =======
//  OCTOKIT
//  =======

const GITHUB_ACCESS_TOKEN = process.env.GITHUB_TOKEN
const octokit = new GitHub({auth: GITHUB_ACCESS_TOKEN})

//  =================
//  RUN GITHUB ACTION
//  =================

//  Runs the GitHub Action
const runAction = async () => {
    const existingLabels = await getLabels(octokit, github)
    existingLabels.forEach(label => console.log(label.name, label.color, label.description))
    const configLabels = readLabels(core)
    configLabels.forEach(label => console.log(label.name, label.color, label.description))
}

//  Try running GitHub Action and catch errors if any
try { runAction() }
catch(err) { core.setFailed(err.message) }