# Features and Design of the YourRoll app.

## Screens
  1. Action Screen
     - Series of Cards that contain images, stats, counters, and actions
     - Double tap to Flip to back of card to change settings of the card
     - Enter edit mode to drag move and add cards

  2. Map Screen
     - Hidden tokens (for fog of war etc.)
     - Icons that indicate there is a detail map for an element. The world map has a bunch of cities that you can tap to see. The city map has buildings that you can tap to see the floorplan map. etc.

      1. Add Token Screen
        - Select from previously uploaded images or upload a new one
      2. Change Map Screen
        - Align and Size to grid for token snapping

  3. Chat Screen
    - Send Photos (Including GIFS!)
    - Send Audio
    - Reactions
    - Replies
    1. Macro Definition Screen
    2. Out of Character chat tab
    3. In Character Chat tab
       - Buttons for types of messages:
         - Character Action (Give this bubble a unique look)
         - Character Talk (Have this look like the avatar has a talk bubble)
       - Buttons to Change which character you are acting as
    4. Private Message Screen
  4. Login Screen
  5. Campaign Select Screen
  6. Character Detail Screen (For backstories and full equipment etc)
  7. Character Creator Screen 
      - 5e Level up tool
      - Nova Level up tool
      - Generic/Customizable Level up tool
  8. Module Shop Screen
    - Pre-built adventures for as little as $1
    - Integrated maps
    - Auto-Populated GM notes

  9. GM planning board
    - Connect notes with locations
    - Connect notes with plot arcs
    - Connect notes with characters
    - Connect notes with events (like when a character dies, or a certain amount of time passes)

    
## Additional features
  Module Creator (separate app perhaps for desktop?)



## Software Models:

  1. Server:
    - Methods:
      - Send Message
      - Delete Message
      - On Message 
      - Send Token (Create new if needed)
      - Delete Token
      - On Token
      - Send Map
      - Delete Map
      - On Map
      - Send Character
      - Delete Character
      - On Charcter
      - Upload Image
      - Upload Audio

  2. Cache Handler:
    Methods:
      getURI (If not in cache it fetches the remote item and caches it and then returns the cached URI)

  3. ImagePickHandler:
    - Methods:
       - PickImage
       - Compress (called by PickImage)
       - Get Permisions (called by PickImage)

  4. Recorder:
    - Methods:
      - StartRecording
      - StopRecording 
      - ConvertRecording (called by StopRecording)
      - Get Permisions (called by StartRecording)

  5. StateManager:
    - Uses Redux under the hood for most info
    - Syncronizes with server
    - Methods:
      - Get Character
      - Set Charcter
      - Get Active Charcter
      - Get Tokens
      - Set Tokens
      - Get Cards
      - Set Cards
      - Get Notes
      - Set Notes
      - Get Messages
      - Send Messages

  6. P2PShare:
    * Peer to Peer Sharing **to avoid server costs**
    * Always uploads to server as well (Uploads are free)
      * If the peer stops sharing, default to the server

## Hierarchy 

User Interaction ->
  - StateManager ->
    - Server
  Recorder ->
    - StateManger ...


