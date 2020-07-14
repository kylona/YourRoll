import firebase from 'firebase'; // 4.8.1
import 'firebase/storage';
import ImageCache from './ImageCache.js';


class Fire {
  constructor() {
    this.init();
    this.observeAuth();
    this.numMessages = 20
  }

  init = () => {
		// Initialize Firebase
		var firebaseConfig = {
			apiKey: "AIzaSyAMT-Ya-8VifrZssPENwiHj2Qmzy3CF6z4",
			authDomain: "nova-rpg.firebaseapp.com",
			databaseURL: "https://nova-rpg.firebaseio.com",
			projectId: "nova-rpg",
			storageBucket: "nova-rpg.appspot.com",
			messagingSenderId: "971553676650",
			appId: "1:971553676650:web:54ea56e7a04f444e701913",
			measurementId: "G-MY4H4TRNZL"
		};
		firebase.initializeApp(firebaseConfig);
    this.database = firebase.database()
  }

  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = user => {
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        alert(message);
      }
    }
  };

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get messages() {
    return this.database.ref('messages');
  }

  get maps() {
    return this.database.ref('maps');
  }

  get tokens() {
    return this.database.ref('tokens');
  }

  parseMessage(snapshot) {
    const { timestamp: numberStamp, id, text, user, image, audio, reply } = snapshot.val();
    const { key: _id } = snapshot;
    const timestamp = new Date(numberStamp);
    return {
      _id,
      id,
      timestamp,
      text,
      user,
      image,
      audio,
      reply,
    };
  };

  get timestamp() {
    return firebase.database.ServerValue.TIMESTAMP;
  }

  onMessage = callback => {
    this.messages
      .limitToLast(40)
      .on('child_added', snapshot => callback(this.parseMessage(snapshot)));
  }
  loadEarlierMessages = (earliest, callback) => {
    this.numMessages += 20
    console.log(earliest.timestamp)
    this.messages
      .orderByChild('timestamp')
      .endAt(earliest.timestamp.getTime() - 1)
      .limitToLast(50)
      .on('child_added', snapshot => callback(this.parseMessage(snapshot)));
  }
  onMap = callback => {
    this.maps.on('value', snapshot => callback(snapshot.val()));
  }
  onTokenAdded = callback => {
    this.tokens.on('child_added', snapshot => callback(snapshot.val()));
  }
  onTokenChanged = callback => {
    this.tokens.on('child_changed', snapshot => callback(snapshot.val()));
  }
  onTokenRemoved = callback => {
    this.tokens.on('child_removed', snapshot => callback(snapshot.val()));
  }

  // send the message to the Backend
  sendMessages = messages => {
    for (let i = 0; i < messages.length; i++) {
      if (!messages[i].audio) messages[i].audio = null
      const {id, text, user, image, audio, reply } = messages[i];
      const message = {
        id,
        text,
        user,
        timestamp: this.timestamp,
        reply,
        audio,
      };
      if (image) {
        message.image = image
      }
      this.messages.push(message)
    }
  };

  // send the message to the Backend
  sendMap = map => {
      this.maps.set(map);
  };

  sendToken = token => {
    this.tokens.child(token.name).set(token)
  }

  removeToken = token => {
    this.tokens.child(token.name).remove()
  }

  // close the connection to the Backend
  offMessages = () => {
    this.messages.off();
  }
  offMap = () => {
    this.maps.off();
  }
  offTokens = () => {
    this.tokens.off();
  }



	uploadImage = (uri, name) => {
    const type = uri.endsWith(".gif") ? 'gif' : 'jpeg';
		return new Promise((resolve, reject) => {
      this.uriToBlob(uri).then((blob) => this.uploadToFirebase(blob, name, type)).then((url) => resolve(url));
      });
	}

	uploadAudio = (uri, name) => {
    const type = 'mp3'
		return new Promise((resolve, reject) => {
      this.uriToBlob(uri).then((blob) => this.uploadToFirebase(blob, name, type)).then((url) => resolve(url));
      });
	}

  uriToBlob = (uri) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        // return the blob
        resolve(xhr.response);
      };
      xhr.onerror = function() {
        // something went wrong
        reject(new Error('uriToBlob failed'));
      };
      // this helps us get a blob
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
	}

  uploadToFirebase = (blob, name, type) => {
    return new Promise((resolve, reject)=>{
      var storageRef = firebase.storage().ref();
      storageRef.child('uploads/' + name + '.' + type).put(blob, {
        contentType: type == 'mp3' ? 'audio/mp3' : 'image/' + type
      }).then((snapshot)=>{
        blob.close()
        storageRef.child('uploads/' + name + '.' + type).getDownloadURL().then((url) => {
        resolve(url);
        });
      }).catch((error)=>{
        reject(error);
      });
    });
  }
}

Fire.shared = new Fire();
export default Fire;


