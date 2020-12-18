import React from 'react';
import Constants from 'expo-constants';
import * as default_ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import Fire from './Fire';


export default class ImagePicker {

  static getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('We need camera roll permissions so you can add an images to maps and messages.');
      }
    }
  }

  static pickImage = async () => {
    await ImagePicker.getPermissionAsync()
    let result = await default_ImagePicker.launchImageLibraryAsync({
      mediaTypes: default_ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.cancelled) {
      const image = result.uri
      return image
    }
    return null
  };

  static pickToken = async () => {
    await ImagePicker.getPermissionAsync()
    let result = await default_ImagePicker.launchImageLibraryAsync({
      mediaTypes: default_ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.2,
    });

    if (!result.cancelled) {
      const image = result.uri
      const ext = "." + image.slice((image.lastIndexOf(".") - 1 >>> 0) + 2);
      const name = 'Token_' + Math.random().toString(36).substr(2,9) + ext
      const remoteImage = await Fire.shared.upload(image, name)
      if (remoteImage !== '') return remoteImage
    }
    return null
  };

}

