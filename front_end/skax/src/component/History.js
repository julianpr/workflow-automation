import React, { Component } from 'react';
import {Menu } from 'semantic-ui-react';
import { Link } from 'react-router-dom';

class History extends Component {
    state = { activeItem: 'history' }
    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    render() {
        const { activeItem } = this.state
        return (
            <div>
                <Menu pointing secondary>
                    <Link to ="/mainmenu"> <Menu.Item name='home' active={activeItem === 'home'} onClick={this.handleItemClick}/> </Link>
                    <Link to ="/workflow"> <Menu.Item name='workflow' active={activeItem === 'workflow'} onClick={this.handleItemClick}/> </Link>
                    <Link to ="/history"> <Menu.Item name='history' active={activeItem === 'history'} onClick={this.handleItemClick}/> </Link>
                    <Menu.Menu position='right'>
                    <Link to="/"> <Menu.Item name='logout' active={activeItem === 'logout'} onClick={this.handleItemClick}/> </Link>
                    </Menu.Menu>
                </Menu>
                <h1> History ada di sini nanti </h1>
            </div>
        );
    }
}


export default History