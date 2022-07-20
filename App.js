import React, { useState, useEffect } from 'react';
import { Button, Image, View, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth,firestore, storage } from './firebase'
export default function ImagePickerExample() {

  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

useEffect(()=>{
  (async()=>{
    if (Platform.OS!=='web'){
      const{status}=   await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status!='granted'){
        alert("Desculpa voce não tem permissão!");
      }
    }
  })();
},[]);

  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    console.log(result);

    if (!result.cancelled) {
      setImage(result.uri);
    }
  };

  const uploadImage=async()=>{
    const blob = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function() {
        resolve(xhr.response);
      };
      xhr.onerror = function() {
        reject(new TypeError('Network request failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', image, true);
      xhr.send(null);
    });

    const ref =storage.ref("teste")
    const snapshot = ref.put(blob)

    snapshot.on(
      storage.TaskEvent.STATE_CHANGE,
      ()=>{
      setUploading(true);
    },
    (error)=>{
      setUploading(false)
      console.log(error)
      blob.close()
      return
    },
    ()=>{
      snapshot.snapshot.ref.getDownloadURL().then((url)=>{
        setUploading(false)
        console.log("download Url ", url)
        blob.close();
        return url
      });
    }
    );
  };

  return (
    <View style=  {styles.container}>
      <Image source={{uri: image }} style ={{ width:300, height:300}}/>
      <Button title='Esolha a Image' onPress={pickImage}> </Button>
      {!uploading?(
      <Button title='Enviar' onPress={uploadImage}/>
      ):(
      <ActivityIndicator size= "large" color="#000"/>)
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent:'center'
  },
});
