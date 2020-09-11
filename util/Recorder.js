import { Audio } from 'expo-av';
import * as Permissions from 'expo-permissions';


class Recorder {
  constructor() {
    this.recording = null,
    this.sound = null,
    this.haveRecordingPermision = false
    //this.recordingSettings = Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
		//*
		this.recordingSettings = {
			android: {
				extension: '.m4a',
				outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
				audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
				sampleRate: 44100,
				numberOfChannels: 2,
				bitRate: 128000,
			},
			ios: {
				extension: '.m4a',
				audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MEDIUM,
				outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
				sampleRate: 44100,
				numberOfChannels: 2,
				bitRate: 128000,
				linearPCMBitDepth: 16,
				linearPCMIsBigEndian: false,
				linearPCMIsFloat: false,
			},
    }
		//*/
  }

  getPermission = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.haveRecordingPermission = response.status === 'granted'
		return this.haveRecordingPermission
  }

  startRecording = async (callback) => {
		if (this.recording != null) return false
		if (! await this.getPermission()) {
			return false
		}
    if (this.sound != null) { // make sure we are not playing back
      await this.sound.unloadAsync();
      this.sound.setOnPlaybackStatusUpdate(null);
      this.sound = null;
    }
    await Audio.setAudioModeAsync({ //setup record settings
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
        playThroughEarpieceAndroid: false,
        staysActiveInBackground: true,
      });
		const recording = new Audio.Recording();
		await recording.prepareToRecordAsync(this.recordingSettings);
		if (callback) recording.setOnRecordingStatusUpdate(callback);
		this.recording = recording;
    this.recording.setProgressUpdateInterval(50)
		await this.recording.startAsync(); 
		return true
  }

	pauseRecording = async () => {
		if(this.recording == null) return
		await this.recording.pauseAsync()
	}

	resumeRecording = async () => {
		if(this.recording == null) return	
		await this.recording.startAsync(); 
	}

	stopRecording = async () => {
    try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
		const recordingPath = this.recording.getURI()
		console.log(recordingPath)
		this.recording = null
		return recordingPath
  }
	
	playAudio = async (url, callback) => {
		await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
    const sound = new Audio.Sound();
    await sound.loadAsync({uri: url});
    this.sound = sound
    this.sound.setProgressUpdateIntervalAsync(50)
		if (callback) sound.setOnPlaybackStatusUpdate(callback)
    this.sound.playAsync();
	}

	pauseAudio = async () => {
		if (this.sound == null) return
		this.sound.pauseAsync()
	}
	
	resumeAudio = async () => {
		if (this.sound == null) return
		this.sound.playAsync()
    let soundStatus = await this.sound.getStatusAsync()
    if (soundStatus.durationMillis == soundStatus.positionMillis) {
      this.sound.replayAsync()
    }
	}

}

Recorder.shared = new Recorder();
export default Recorder
