import Fire from './Fire.js'
export default class AppStateUpdater {

  static updateState(appState) {
    if (appState.version == '0.07') {
      appState = AppStateUpdater.update007To008(appState)
    }
    return appState
  }

  static update007To008(appState) {
    appState.version = 0.08
    for (table of appState.tables.list) {
      appState[table.id].users = [] 
    }
    console.log("Updated State", appState)
    return appState
  }

}

