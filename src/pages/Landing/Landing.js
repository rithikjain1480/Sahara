import React, { Component } from 'react';
import './Landing.css';
import LandingButtons from '../../components/LandingButtons/LandingButtons';
import { Header, Icon } from 'semantic-ui-react';
import landingImage from '../../images/landingImage.jpg';

export default class Landing extends Component {
    redirect(target) {
        window.location = target;
    }

    render() {
        // <img className="landingImage" src={landingImage} alt="girl reading book" />
        return (
            <div className="landing">
                <React.Fragment>
                    <LandingButtons />
                    <Header as='h1' icon className="pageHeader">
                        <Icon name='home' />
                        Sahara Books
                    </Header>
                    <div className="landingContent">
                        <div>
                            <p>Welcome to Sahara Books!</p>
                            <p>Find used books!</p>
                            <p>Sell your used books!</p>
                            <p>No hidden fees!</p>
                        </div>
                    </div>
                </React.Fragment>
            </div>
        );
    }
}
