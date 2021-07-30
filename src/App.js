import React, { Component } from 'react';
import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import Particles from 'react-particles-js';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const particlesOptions = {
  particles: {
    number: {
      value: 70,
      density: {
        enable: true,
        value_area: 600
      }
    }
  }
}

const initialState = {
  input: '',
  imageUrl: '',
  box: {},
  route: 'signin',
  isSignedIn: false,
  user:
    {
      id: '',
      name: '',
      email: '',
      entries: 0,
      joined: ''
    }
}

class App extends Component {
  constructor() {
    super();
    this.state = initialState;
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000')
  //     .then(response => response.json())
  //     .then(console.log);
  // }

  loadUser = (data) => {
    // console.log('app', data);
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width, height);
    return {
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height),
    }
  }

  displayFaceBox = box => this.setState({box: box});
  onInputChange = event => this.setState({input: event.target.value});

  onPictureSubmit = () => {
    // console.log('onInputChange input', this.state.input);
    // console.log('click');
    this.setState({imageUrl: this.state.input});
    
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
      .then(response => response.json())
      .then (response => {
        // console.log(response.outputs[0].data.regions[0].region_info.bounding_box);
        this.displayFaceBox(this.calculateFaceLocation(response));
        if(response) {
          fetch('http://localhost:3000/image', {
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({id: this.state.user.id})
          })
            .then(response => response.json())
            .then(count => {
              this.setState(Object.assign(this.state.user, { entries: count }))
            })
            .catch(console.log)
        }
      })
      .catch(err => console.log(err))
  }

  onRouteChange = (route) => {
    if (route === 'signout') this.setState(initialState)
    else if (route === 'home') this.setState({isSignedIn: true});
    this.setState({route: route});
  }

  render() {
    const { imageUrl, box, isSignedIn, route, user } = this.state;
    return (
      <div className='App'>
         <Particles className='particles'
              params={particlesOptions}
            />
        <Navigation onRouteChange={this.onRouteChange} isSignedIn={isSignedIn}/>
        {
          route === 'home'
            ? <div>
                <Logo />
                <Rank name={user.name} entries={user.entries} />
                <ImageLinkForm
                  onInputChange={this.onInputChange}
                  onPictureSubmit={this.onPictureSubmit}
                />
                <FaceRecognition 
                  box={box} 
                  imageUrl={imageUrl} 
                />
              </div>
            : (route === 'signin' || route === 'signout'
                ? <Signin onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
                : <Register onRouteChange={this.onRouteChange} loadUser={this.loadUser} />
              )
        }
      </div>
    );
  }
}

export default App;
