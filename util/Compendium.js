import { parseString } from 'react-native-xml2js';

class Compendium {

  onLoadingFinished() {
    console.log(Object.keys(this.spells).length)
    console.log(Object.keys(this.classes).length)
    console.log(Object.keys(this.races).length)
    console.log(this.classes["Paladin"])
  }

  constructor() {
    this.workLeft = 1
    this.spells = {}
    this.classes = {}
    this.races = {}
    console.log("Fetching Compendium")
    fetch("https://raw.githubusercontent.com/kinkofer/FightClub5eXML/master/Collections/CorePlusUA-NoHomebrew.xml")
    .then(response => response.text())
    .then(data => {
      parseString(data, (err, result) => {
        for (let i in result.collection.doc) {
            let newURL = result.collection.doc[i].$.href.replace("../", "https://raw.githubusercontent.com/kinkofer/FightClub5eXML/master/")
            if (newURL.includes('spell')) {
              this.workLeft += 1
              fetch(newURL).then(spellResponse => spellResponse.text())
              .then(data => {
                parseString(data, (err, spellResult) => {
                  for (let n in spellResult.compendium.spell) {
                    let name = spellResult.compendium.spell[n].name[0]
                    this.spells[name] = spellResult.compendium.spell[n]
                  }
                  this.workLeft -= 1
                  if (this.workLeft == 0) {
                    this.onLoadingFinished()
                  }
                })
              })
            }
            if (newURL.includes('class')) {
              this.workLeft += 1
              fetch(newURL).then(classResponse => classResponse.text())
              .then(data => {
                parseString(data, (err, classResult) => {
                  for (let n in classResult.compendium.class) {
                    let name = classResult.compendium.class[n].name[0]
                    this.classes[name] = classResult.compendium.class[n]
                  }
                  this.workLeft -= 1
                  if (this.workLeft == 0) {
                    this.onLoadingFinished()
                  }
                })
              })
            }
            if (newURL.includes('race')) {
              this.workLeft += 1
              fetch(newURL).then(spellResponse => spellResponse.text())
              .then(data => {
                parseString(data, (err, raceResult) => {
                  for (let n in raceResult.compendium.race) {
                    let name = raceResult.compendium.race[n].name[0]
                    this.races[name] = raceResult.compendium.race[n]
                  }
                  this.workLeft -= 1
                  if (this.workLeft == 0) {
                    this.onLoadingFinished()
                  }
                })
              })
            }
        }
      })
      this.workLeft -= 1;
    })
  }

}

Compendium.shared = new Compendium()
export default Compendium;
