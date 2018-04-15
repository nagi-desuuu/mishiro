import * as sqlite3 from '../../@types/sqlite3/'
import { Event } from 'electron'

export default async function (event: Event, manifestFile: string, resVer: number) {
  let manifest: undefined | sqlite3.Database = await sqlite3.openAsync(manifestFile)
  let manifests: any[] = []
  let manifestData: any = {}

  manifests = await manifest._all('SELECT name, hash FROM manifests')
  manifestData.liveManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "l/%"')
  manifestData.bgmManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "b/%"')
  manifestData.voiceManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "v/%"')
  manifestData.scoreManifest = await manifest._all('SELECT name, hash FROM manifests WHERE name LIKE "musicscores_m___.bdb"')

  manifest.close(err => {
    if (err) throw err
    manifest = void 0
  })

  let masterHash = ''
  for (let i = 0; i < manifests.length; i++) {
    if (manifests[i].name === 'master.mdb') {
      masterHash = manifests[i].hash
    }
  }
  console.log(`manifest: ${manifests.length}`)
  console.log(`bgm: ${manifestData.bgmManifest.length}`)
  console.log(`live: ${manifestData.liveManifest.length}`)
  event.sender.send('readManifest', masterHash, resVer)
  return { manifests, manifestData }
}