import React, { Component } from 'react';
import {Grid, Image, Button, Icon } from 'semantic-ui-react';
import { Link } from 'react-router-dom';
import logo from '../asset/logo.png';

class Home extends Component {
  render() {
    return (
      <div style={{position: "absolute", top:"0px", bottom:"0px", left:"0px", right:"0px", backgroundImage: `url("http://i0.kym-cdn.com/photos/images/newsfeed/000/171/876/pusheen-nyan-cat.gif")`, minHeight: "100"}}>
        <Grid columns='equal' style={{padding: "170px 0px 0px 81px"}}>
          <Grid.Column>
          </Grid.Column>
          <Grid.Column width={5}>
            <Image src={logo} size='medium'/>
            <Link to="/mainmenu">
                  <Button animated style={{margin: "0px 0px 0px 81px"}}> 
                    <Button.Content visible>Getting Started</Button.Content>
                    <Button.Content hidden>
                      <Icon name='right arrow' />
                    </Button.Content>
                  </Button>
              </Link>
          </Grid.Column>
          <Grid.Column>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

export default Home;
