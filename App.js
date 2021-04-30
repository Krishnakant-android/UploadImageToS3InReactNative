// App.js

import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import {RNS3} from 'react-native-aws3';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      s3ImagePath: 'null',
      loading: false,
    };
  }

  // Launch Camera
  cameraLaunch = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };
    ImagePicker.launchCamera(options, (res) => {
      console.log('Response = ', res);

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        // const source = { uri: res.uri };
        // console.log('response', source);
        // this.setState({
        //   filePath: res,
        //   fileData: res.data,
        //   fileUri: res.uri
        // });
        this.setState({loading: true});
        this.uploadImagetoServer(res);
      }
    });
  };

  imageGalleryLaunch = () => {
    let options = {
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    };

    ImagePicker.launchImageLibrary(options, (res) => {
      console.log('Response = ', res);

      if (res.didCancel) {
        console.log('User cancelled image picker');
      } else if (res.error) {
        console.log('ImagePicker Error: ', res.error);
      } else if (res.customButton) {
        console.log('User tapped custom button: ', res.customButton);
        alert(res.customButton);
      } else {
        // const source = { uri: res.uri };

        // console.log('response', source);
        // this.setState({
        //   filePath: res,
        //   fileData: res.data,
        //   fileUri: res.uri,
        // });
        this.setState({loading: true});
        this.uploadImagetoServer(res);
      }
    });
  };

  uploadImagetoServer = (response) => {
    const file = {
      uri: response.uri,
      name: response.fileName,
      type: 'image/jpeg',
    };

    const options = {
      keyPrefix: 'images/',
      bucket: 'Your bucket name',
      region: 'ap-south-1',
      accessKey: 'Access key here',
      secretKey: 'Secret key here',
      successActionStatus: 201,
    };

    return RNS3.put(file, options)
      .then((response) => {
        this.setState({
          loading: false,
          s3ImagePath: 'null',
        });
        console.log('Server Response >> ', response);
        if (response.status !== 201)
          throw new Error('Failed to upload image to S3');
        else {
          console.log(
            'Successfully uploaded image to s3. s3 bucket url: ',
            response.body.postResponse.location,
          );
          this.setState({
            loading: false,
            s3ImagePath: response.body.postResponse.location,
          });
        }
      })
      .catch((error) => {
        console.log(error);
        // this.setState({loading = false});
      });
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.container}>
          {this.state.loading ? (
            <ActivityIndicator
              //visibility of Overlay Loading Spinner
              visible={this.state.loading}
              //Text with the Spinner
              textContent={'Loading...'}
              //Text style of the Spinner Text
              textStyle={styles.spinnerTextStyle}
            />
          ) : (
            <>
              <Image
                source={{uri: this.state.s3ImagePath}}
                style={{width: 200, height: 200}}
              />
              <TouchableOpacity
                onPress={this.cameraLaunch}
                style={styles.button}>
                <Text style={styles.buttonText}>Launch Camera Directly</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={this.imageGalleryLaunch}
                style={styles.button}>
                <Text style={styles.buttonText}>
                  Launch Image Gallery Directly
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  button: {
    width: 250,
    height: 60,
    backgroundColor: '#3740ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 15,
    color: '#fff',
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});
