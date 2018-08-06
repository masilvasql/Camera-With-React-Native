import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  CameraRoll,
  StatusBar,
  Vibration
} from "react-native";
import { Camera, Permissions, ImageManipulator } from 'expo';
import { Container, Content, Header, Icon, Footer, Left, Item, } from 'native-base';

const flashModeOrder = { // constante onde guarda todos os possíveis estados do Flash
  off: 'on',
  on: 'auto',
  auto: 'torch',
  torch: 'off',
};

export default class App extends React.Component {

  constructor() {
    super()
    this.state = {
      uriImagem: null,
      flash: 'off', // estado inicial do flash
    }
  }

  state = {
    switchValue: false,
    hasCameraPermission: null,
    permissaoDeGravacaoDaFoto: null,
    type: Camera.Constants.Type.back,
  };

  toggleFlash = () => this.setState({ flash: flashModeOrder[this.state.flash] });

  snap = async () => { // início da função para tirar foto
    if (this.camera) {
      Vibration.vibrate()
      let photo = await this.camera.takePictureAsync(); // variável onde irá conter os metadados da foto capturada

      let resizedPhoto = await ImageManipulator.manipulate( // início da função onde irá redimensionar a imagem
        photo.uri,
        [{ resize: { width: 1080, height: 1920 } }],
        { compress: 1, format: "jpg", base64: false }
      );

      this.setState({ uriImagem: photo.uri })
      console.log(photo);

      CameraRoll.saveToCameraRoll(resizedPhoto.uri, 'photo').then((result) => { // função onde irá salvar na galeria
        console.log('deu boa', result);
      }), (error) => {
        console.log('erro', error);
      }
    }
  };

  cameraChange = () => { // função para alternar entre camera frontal e trazeira 
    this.setState({
      type:
        this.state.type === Camera.Constants.Type.back
          ? Camera.Constants.Type.front
          : Camera.Constants.Type.back
    });
  };

  async componentWillMount() { // função assincrona onde pedirá as permissões para o usuário

    const { status } = await Permissions.askAsync(Permissions.CAMERA); // solicita permissão de usso da camera
    this.setState({ hasCameraPermission: status === 'granted' });

    let permission = await Expo.Permissions.askAsync(Expo.Permissions.CAMERA_ROLL); // solicita permissão para salvar na galeria
    if (permission.status === 'granted') {
      this.setState({ permissaoDeGravacaoDaFoto: 'granted' })
    }
  }

  render() {
    const { hasCameraPermission } = this.state;

    if (hasCameraPermission === null) {
      return
      <View>
        <Text> Aguardando Permissão da Câmera </Text>
      </View>
    } else {
      return (
        <View style={styles.container}>
          <Camera

            flashMode={this.state.flash}
            style={{ width: '100%', height: '100%' }}
            ref={ref => { this.camera = ref; }}
            type={this.state.type}>
            <Container style={{ backgroundColor: 'transparent' }}>
              <Header style={{ backgroundColor: 'transparent' }}>
                <View
                  style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}
                >
                  <TouchableOpacity
                    onPress={this.cameraChange}
                  >
                    <Icon type="FontAwesome" name="undo" style={{ fontSize: 30, color: '#fff' }} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={this.toggleFlash}
                  >
                    <Item>
                      <Icon type="FontAwesome" name="bolt" style={{ fontSize: 30, color: '#fff' }} />
                      <Text style={{ fontSize: 18, color: '#fff' }}> {this.state.flash} </Text>
                    </Item>
                  </TouchableOpacity>
                </View>
              </Header>
              <Content style={{ backgroundColor: 'transparent' }} />
              <Footer style={{ backgroundColor: 'transparent' }}>
                <View>
                  <TouchableOpacity
                    onPress={this.snap}
                  >
                    <Icon type="FontAwesome" name="camera" style={{ fontSize: 50, color: '#fff' }} />
                  </TouchableOpacity>
                </View>
              </Footer>
            </Container>
          </Camera>
        </View>
      );
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: StatusBar.currentHeight
  },
});
