import Fire from './Fire.js'
export default class AppStateUpdater {

  static updateState(appState) {
    if (appState.version == '0.07') {
      appState = AppStateUpdater.update007To008(appState)
      appState = AppStateUpdater.update008To009(appState)
    }
    return appState
  }

  static update007To008(appState) {
    appState.version = 0.08
    for (table of appState.tables.list) {
      appState[table.id].users = [] 
      appState[table.id].macros['initiative'] = 'Initiative: 1d20 + $dexmod'
    }
    console.log("Updated State to 0.8")
    return appState
  }

  static update008To009(appState) {
    appState.version = 0.09
    for (table of appState.tables.list) {
      appState[table.id].map = {
        image: appState[table.id].map.image || null,
        scale: appState[table.id].map.scale || null,
        local: appState[table.id].map.local || null,
        art: appState[table.id].map.art || [],
      }
    }
    console.log("Updated State to 0.9")
    return appState
  }

}

