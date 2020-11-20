import firebase from 'firebase'; // 4.8.1
import 'firebase/storage';

class Fire {
  constructor() {
    this.loaded = false
    this.init()
    this.tableId = null
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
    this.observeAuth();
    try {
      firebase.auth().signInAnonymously()
    }
    catch ({ message }) {
      alert(message);
    }
  }

  observeAuth = () =>
    firebase.auth().onAuthStateChanged(this.onAuthStateChanged);

  onAuthStateChanged = user => {
    console.log("AUTH STATE CHANGE")
    console.log(user.uid)
    if (!user) {
      try {
        firebase.auth().signInAnonymously();
      } catch ({ message }) {
        alert(message);
      }
    }
    else {
      Fire.shared.loaded = true
    }
  };

  get uid() {
    return (firebase.auth().currentUser || {}).uid;
  }

  get tableName() {
    return this.database.ref(Fire.shared.tableId).child('name');
  }

  get messages() {
    return this.database.ref(Fire.shared.tableId).child('messages');
  }

  get maps() {
    return this.database.ref(Fire.shared.tableId).child('maps');
  }

  get pinnedMessage() {
    return this.database.ref(Fire.shared.tableId).child('pinnedMessage');
  }

  get tokens() {
    return this.database.ref(Fire.shared.tableId).child('tokens');
  }

  get macros() {
    return this.database.ref(Fire.shared.tableId).child('macros');
  }

  get typing() {
    return this.database.ref(Fire.shared.tableId).child('typing');
  }

  get users() {
    return this.database.ref(Fire.shared.tableId).child('users');
  }

  parseMessage(snapshot) {
    const { timestamp: numberStamp, id, text, user, image, audio, reply, rolls, reactions } = snapshot.val();
    const timestamp = new Date(numberStamp);
    return {
      _id: 'Message_' + Math.random().toString(36).substr(2,9),
      id,
      timestamp,
      text,
      user,
      image,
      audio,
      reply,
      rolls,
      reactions,
    };
  };

  get timestamp() {
    return Date.now();
  }

  onMacroReceived = (callback) => {
    this.macros.on('child_added', snapshot => callback(snapshot.val()));
  }

  onMacroUpdated = callback => {
    this.macros.on('child_changed', snapshot => callback(snapshot.val()));
  }

  onMacroDeleted = callback => {
    this.macros.on('child_removed', snapshot => callback(snapshot.val()));
  }

  onTypingReceived = (callback) => {
    this.typing.on('child_added', snapshot => callback(snapshot.val()));
  }

  onTypingDeleted = callback => {
    this.typing.on('child_removed', snapshot => callback(snapshot.val()));
  }

  onMessageReceived = (latest, callback) => {
    if (false && latest != null) {
      this.messages
        .orderByChild('timestamp')
        .startAt(latest.timestamp - 1)
        .on('child_added', snapshot => callback(this.parseMessage(snapshot)));
    }
    else {
      this.messages
        .orderByChild('timestamp')
        .limitToLast(20)
        .on('child_added', snapshot => callback(this.parseMessage(snapshot)));
    }
  }

  onMessageUpdated = callback => {
    this.messages
      .on('child_changed', snapshot => callback(this.parseMessage(snapshot)));
  }

  onMessageDeleted = callback => {
    this.messages
      .on('child_removed', snapshot => callback(this.parseMessage(snapshot)));
  }

  loadEarlierMessages = (earliest, callback) => {
    this.messages
      .orderByChild('timestamp')
      .endAt(earliest.timestamp - 1)
      .limitToLast(20)
      .on('child_added', snapshot => callback(this.parseMessage(snapshot)));
  }
  onMap = callback => {
    this.maps.on('value', snapshot => callback(snapshot.val()));
  }
  onPinnedMessage = callback => {
    this.pinnedMessage.on('value', snapshot => callback(snapshot.val()));
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


  onUserAdded = callback => {
    this.users.on('child_added', snapshot => callback(snapshot.val()));
  }
  onUserChanged = callback => {
    this.users.on('child_changed', snapshot => callback(snapshot.val()));
  }
  onUserRemoved = callback => {
    this.users.on('child_removed', snapshot => callback(snapshot.val()));
  }

  onTableNameChanged = callback => {
    console.log("SETTING TABLE NAME LISTENER")
    this.tableName.on('value', snapshot => callback(snapshot.val()))
  }


  // send the message to the Backend
  sendMessages = messages => {
    for (let m in messages) {
      this.messages.child(messages[m].id).set(messages[m])
    }
  };

  pushNotification = async (token, title, body) => {
			let response = null
      const data = {
        to: token,
        title:title,
        priority: "high",
        sound: "default", // android 7.0 , 6, 5 , 4
        body: body,
      }
			try {
				 response = await fetch(
					"https://exp.host/--/api/v2/push/send",
					{
						method: "POST",
						headers: {
						 "Accept": "application/json",
						 "Content-Type": "application/json"
						},
						body: JSON.stringify(data)
				 }
				);
			} 
			catch (e) {
				console.log("Push Notification Error: " + e)	
			}
			return response;
  }

  deleteMessage = message => {
    this.messages.child(message.id).remove()
  }

  updateMessage = message => {
    this.messages.child(message.id).update(message)
  }

  sendMap = map => {
      this.maps.set(map);
  };

  sendPinnedMessage = text => {
      this.pinnedMessage.set(text);
  };

  sendUser = user => {
    this.users.child(user.id).set(user)
  }

  sendToken = token => {
    this.tokens.child(token.name).set(token)
  }

  removeToken = token => {
    this.tokens.child(token.name).remove()
    //TODO delete image from storage
  }

  sendMacro = macro => {
    this.macros.child(macro.name).set(macro)
  }

  deleteMacro = macro => {
    this.macros.child(macro.name).remove()
  }

  sendTyping = typing => {
    this.typing.child(typing.id).set(typing)
  }

  deleteTyping = typing => {
    this.typing.child(typing.id).remove()
  }


  // close the connection to the Backend
  offEverything = () => {
    if (!this.tableId) return
    this.messages.off();
    this.maps.off();
    this.pinnedMessage.off();
    this.tokens.off();
    this.users.off();
    this.tableName.off();
  }
  offMessages = () => {
    this.messages.off();
  }
  offMap = () => {
    this.maps.off();
  }
  offPinnedMessage = () => {
    console.log("OFF PINNED MESSAGE")
    this.pinnedMessage.off();
  }
  offTokens = () => {
    this.tokens.off();
  }
  offUsers = () => {
    this.users.off();
  }


  upload = (uri) => {
    const ext = "." + uri.slice((uri.lastIndexOf(".") - 1 >>> 0) + 2);
    const name = 'YourRollData_' + Math.random().toString(36).substr(2,9) + ext
    return new Promise((resolve, reject) => {
      this.uriToBlob(uri)
      .then((blob) => this.uploadToFirebase(blob, name))
      .then((url) => resolve(url));
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

  uploadToFirebase = (blob, name) => {
    const contentType = name.endsWith('.m4a') ? 'audio/m4a' :
                        name.endsWith('.jpeg') ? 'image/jpeg' :
                        name.endsWith('.gif') ? 'image/gif' :
                        ''
    return new Promise((resolve, reject)=>{
      var storageRef = firebase.storage().ref();
      storageRef.child('uploads/' + name).put(blob, {
        contentType: contentType
      }).then((snapshot)=>{
        blob.close()
        storageRef.child('uploads/' + name).getDownloadURL().then((url) => {
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


