import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';

class BlobCache {

  constructor() {
  }

  async get(uri) {
      try {
      filesystemURI = await this.getFilesystemKey(uri)
      blobURI = await this.loadBlob(filesystemURI, uri);
      return blobURI
      }
      catch(e) {
        console.log(e)
        console.log("failed to cache: ")
        console.log(uri)
      }
  }

  async cache(keyURI, uri) {
      filesystemURI = await this.getFilesystemKey(keyURI)
      blobURI = await this.loadBlob(filesystemURI, uri);
  }


  async getFilesystemKey(remoteURI) {
    const hashed = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      remoteURI
    );
    const key = `${FileSystem.cacheDirectory}${hashed}`;
    const ext = "." + remoteURI.slice((remoteURI.lastIndexOf(".") - 1 >>> 0) + 2);
    return key + ext
  }

  async loadBlob(filesystemURI, remoteURI) {
    try {
      // Use the cached image if it exists
      const metadata = await FileSystem.getInfoAsync(filesystemURI);
      if (metadata.exists) {
        return filesystemURI
      }

      // otherwise download to cache
      const blob = await FileSystem.downloadAsync(
        remoteURI,
        filesystemURI
      );
      return blob.uri
    } catch (err) {
      console.log('Blob loading error:', err);
      return remoteURI
    }
  }

}

BlobCache.shared = new BlobCache()
export default BlobCache
