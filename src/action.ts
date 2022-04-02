//  Library
import * as core from '@actions/core'
import * as github from '@actions/github'
import { syncConfigLabels, syncRepoLabels } from './library'
import { config } from './config'

//  ==========
//  LABEL SYNC
//  ==========

/** Label-Sync-Action */
async function action() {

    if (github.context.eventName === 'label') {     //  If the action was triggered by the label webhook event

        core.info(`Synchronizing labels from your repository to ${config}`)
        await syncConfigLabels()

    } else {    //  If the action was triggered on push or manually by workflow dispatch or any other means

        core.info(`Synchronizing labels from ${config} to your repository`)
        await syncRepoLabels()

    }

    core.notice('🏷 Synchronization Complete! ✅')

}


//  -----------------
export default action
//  -----------------