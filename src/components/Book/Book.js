import React, { Component } from 'react';
import './Book.css';
import {Link} from 'react-router-dom';
import {Card, Image, Feed} from 'semantic-ui-react';
import firebase from '../Firebase';

export default class Book extends Component {
    constructor(props){
        super(props);

        var roundedPrice = parseFloat(this.props.price).toFixed(2);
        this.state = {
            price: ("$" + roundedPrice),
            image: ''
        };
    }

    componentDidMount(){
        var storageRef = firebase.storage().ref();
        storageRef.child(this.props.image.substring(0, this.props.image.length - 4)).getDownloadURL().then((url) => {
            this.setState({
                image: url
            });
        });
    }

    render() {
        return (
            <div className="bookWrapper">
                <Card className="book" href={"/product/" + this.props.group + '/' + this.props.doc}>
                    <Card.Content>
                        <Card.Header>{this.props.title}</Card.Header>
                    </Card.Content>
                    <Card.Content>
                        <Feed>
                            <Feed.Event>
                                <Feed.Label className="bookImage" image={this.state.image} />
                                <Feed.Content>
                                    <Feed.Summary className="bookDescription">
                                        <p>By {this.props.author}</p>
                                        <p>{this.state.price}</p>
                                    </Feed.Summary>
                                </Feed.Content>
                            </Feed.Event>
                        </Feed>
                    </Card.Content>
                </Card>
            </div>
        );
    }
}
