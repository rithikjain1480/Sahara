import React, {Component} from 'react';
import './GroupProfile.css';
// import Button from '../../components/Button/Button';
import GroupNavBar from '../../components/GroupNavBar/GroupNavBar';
import TextField from '../../components/TextField/TextField';
import {withRouter} from 'react-router-dom';
import {Redirect} from 'react-router-dom';
import firebase from '../../components/Firebase';
import uuid from 'uuid';
import {Icon, Header, Modal, Button, Form} from 'semantic-ui-react';

class GroupProfile extends Component {
    constructor(props){
        super(props);

        this.state = {
            code: '',
            categories: [],
            renderCategories: [],
            search: '',
            searched: false,
            open: false,
            images: [],
            name: '',
            newCategory: ''
        }

        this.removeCategory = this.removeCategory.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handlePicChange = this.handlePicChange.bind(this);
        this.handleChangeCategory = this.handleChangeCategory.bind(this);
        this.handleAddCategory = this.handleAddCategory.bind(this);
    }

    componentDidMount(){
        this.updateData();

        const images = require.context('../../images', true);
        var imagesArr = [];
        for(var i = 1; i < 10; i++){
            var imgName = 'Pic' + i;
            imagesArr.push(images('./profiles/' + imgName + '.png'));
        }
        this.setState({
            images: imagesArr
        });
    }

    componentDidUpdate(prevProps, prevState){
        if(this.state.refresh){
            this.updateData();
        }
    }

    updateData(){
        var db = firebase.firestore();
        db.collection('Groups').where('email', '==', this.props.user['email']).get().then((snapshot) => {
            var group = snapshot.docs[0];
            var data = group.data();
            const images = require.context('../../images', true);
            console.log(data.name);
            this.setState({
                code: group.id,
                image: data.pimage ? images('./profiles/' + data.pimage + '.png') : '',
                name: data.name,
                categories: data.categories
            });

            var tempCategories = [];
            data.categories.forEach((category, i) => {
                tempCategories.push(<div className="groupCategories" key={i}><p>{category}</p> <Button color='red' name={category} onClick={this.removeCategory}>Delete Category</Button></div>)
            });
            this.setState({
                renderCategories: tempCategories,
                refresh: false
            });
        });
    }

    removeCategory(event){
        event.preventDefault();

        var db = firebase.firestore();
        db.collection('Groups').doc(this.state.code).update({
            categories: firebase.firestore.FieldValue.arrayRemove(event.target.name)
        }).then(() => {
            this.setState({
                refresh: true
            });
        });
    }

    handleChange(event) {
        event.preventDefault();

        var search = event.target.value;
        var searchSplit = search.split(" ");
        var tempSearch = "";
        searchSplit.forEach((item, i) => {
            tempSearch += (item + "+");
        });
        this.setState({
            search: tempSearch.substring(0, tempSearch.length-1)
        });
    }

    handleSubmit(event){
        event.preventDefault();

        if(event.target.value !== ''){
            this.setState({
                searched: true
            });
        }
    }

    handlePicChange(event){
        event.preventDefault();
        const images = require.context('../../images', true);
        // this may break depending on how the url ends up looking
        var imgName = event.target.src.split('/')[5].split('.')[0];
        this.setState({
            img: images('./profiles/' + imgName + '.png')
        });

        var db = firebase.firestore();
        db.collection('Groups').doc(this.state.code).update({
            pimage: imgName
        });

        this.setState({
            open: false,
            refresh: true
        });
    }

    handleChangeCategory(event){
        const target = event.target;

        this.setState({
            newCategory: target.value
        });
    }

    handleAddCategory(event){
        event.preventDefault();

        var db = firebase.firestore();

        db.collection('Groups').doc(this.state.code).update({
            categories: firebase.firestore.FieldValue.arrayUnion(this.state.newCategory)
        }).then(() => {
            this.setState({
                refresh: true,
                newCategory: ''
            });
        });

        try {
            document.getElementById('addCategoryForm').reset();
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        var search = "?q=" + this.state.search;
        var profileImages = [];
        this.state.images.forEach((item, i) => {
            profileImages.push(<img className="modalProfileImage" key={i} src={item} alt="profile image" onClick={this.handlePicChange} />);
        });
        return (
            <div className="groupProfile">
                <GroupNavBar handleChange={this.handleChange} handleSubmit={this.handleSubmit} />
                {this.state.searched ?
                    <Redirect to={{
                        pathname: '/group/search',
                        search: search,
                        state: {
                            group: this.state.group
                        },
                        key: uuid.v4()
                    }} />
                    :
                    <React.Fragment>
                        <div className="groupProfileContent">
                            <div className="groupProfileWrapper">
                                <Modal
                                    closeIcon
                                    open={this.state.open}
                                    trigger={<img className="groupProfileImage" src={this.state.image} alt="profile" />}
                                    onClose={() => {
                                        this.setState({
                                            open: false
                                        });
                                    }}
                                    onOpen={() => {
                                        this.setState({
                                            open: true
                                        });
                                    }}
                                >
                                    <Header icon='user' content='Change Profile Picture' />
                                    <Modal.Content className="modalProfileImages">
                                        {profileImages}
                                    </Modal.Content>
                                </Modal>
                                <div className="groupProfileHeader">
                                    <h1>{this.state.name}</h1>
                                    <p>Group Code: {this.state.code}</p>
                                </div>
                                <h2>Categories</h2>
                                <div className="groupProfileCategories">
                                    {this.state.renderCategories}
                                    <div className="addCategory">
                                        <Form id="addCategoryForm" onSubmit={this.handleAddCategory}>
                                            <TextField label="Add Category" type="addCategory" placeholder="New Category Name" onChange={this.handleChangeCategory} />
                                        </Form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment>
                }
            </div>
        );
    }
}

export default withRouter(GroupProfile);
