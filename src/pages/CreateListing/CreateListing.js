import React, { Component } from 'react';
import './CreateListing.css';
import TextField from '../../components/TextField/TextField';
import CheckBox from '../../components/CheckBox/CheckBox';
import GroupRadioButton from '../../components/GroupRadioButton/GroupRadioButton';
import NavBar from '../../components/NavBar/NavBar';
import SubmitButton from '../../components/SubmitButton/SubmitButton';
import firebase from '../../components/Firebase';
import {Redirect} from 'react-router-dom';
import {Form, Dropdown, Button, Icon, Label, Header, Image} from 'semantic-ui-react';
import background from '../../images/createListing.png';

export default class CreateListing extends Component {
    constructor(props){
        super(props);

        this.state = {
            codes: [],
            code: '',
            title: '',
            isbn: '',
            author: '',
            desc: '',
            price: '',
            condition: '',
            redirect: false,
            groupRadioButtons: [],
            categories: [],
            categoryBoxes: [],
            books: [],
            search: '',
            searching: false,
            file: null
        };

        this.handleChange = this.handleChange.bind(this);
        this.handleChangeCheck = this.handleChangeCheck.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.addCategories = this.addCategories.bind(this);
        this.handleChangeSearch = this.handleChangeSearch.bind(this);
        this.handleSubmitSearch = this.handleSubmitSearch.bind(this);
        this.onFileChange = this.onFileChange.bind(this);

        this.fileRef = React.createRef();
    }

    componentDidMount(){
        const db = firebase.firestore();
        var groups = [];
        db.collection('Members').doc(this.props.user['email']).get().then((doc) => {
            var data = doc.data();
            groups = data.groupcodes;
            this.setState({
                codes: data.groupcodes
            });
        }).then(() => {
            this.createRadioButtons(null);
        }).then(() => {
            var tempBooks = [];
            groups.forEach((group, i) => {
                db.collection('Groups').doc(group).collection('Listings').get().then((snapshot) => {
                    var book;
                    snapshot.docs.forEach((item, j) => {
                        book = item.data();
                        book['document'] = item.id;
                        tempBooks.push(book);
                    });
                    if(i + 1 === groups.length){
                        this.setState({
                            books: tempBooks,
                        });
                    }
                });
            });
        });
    }

    handleChange(event){
        const target = event.target;
        const name = target.name;
        if(!name){
            this.setState({
                condition: target.textContent
            });
        }
        else {
            this.setState({
                [name]: target.value
            });
        }
    }

    handleChangeCheck(event){
        const target = event.target;
        const name = target.textContent;
        this.setState({
            code: name
        });

        this.createRadioButtons(name);
    }

    createRadioButtons(name){
        var db = firebase.firestore();
        var groupRadioButtons = [];
        this.state.codes.forEach((group, i) => {
            var tempCategories = [];
            db.collection('Groups').doc(group).get().then((snapshot) => {
                var categories = snapshot.data().categories;
                categories.forEach((item, j) => {
                    tempCategories.push(<CheckBox key={item + i} label={item} type={item.toLowerCase()} onChange={this.addCategories} />)
                    if(j + 1 === categories.length){
                        groupRadioButtons.push(<GroupRadioButton key={i} label={group} type={group} name="createListingRadio" categories={tempCategories} onChange={this.handleChangeCheck} showCategories={name === group} />);
                    }
                    if(i + 1 === this.state.codes.length){
                        this.setState({
                            groupRadioButtons: groupRadioButtons
                        });
                    }
                });
            });
        });
    }

    addCategories(event){
        const target = event.target;
        const checked = target.checked;
        const name = target.innerHTML;

        if(!this.state.categories.includes(name)){
            this.setState({
                categories: [...this.state.categories, name]
            });
        }
        else if(this.state.categories.includes(name)){
            var tempCategories = [];
            this.state.categories.forEach((item, i) => {
                if(item !== name){
                    tempCategories.push(item);
                }
            });
            this.setState({
                categories: tempCategories
            });
        }
    }

    handleSubmit(event){
        event.preventDefault();

        if(this.state.author === '' || this.state.isbn === '' || this.state.name === '' || this.state.price === '' || this.state.desc === '' || this.state.code === '' || this.state.condition === ''){
            console.log('here');
            console.log(this.state.author);
            console.log(this.state.isbn);
            console.log(this.state.name);
            console.log(this.state.price);
            console.log(this.state.desc);
            console.log(this.state.code);
            console.log(this.state.condition);
            return;
        }
        else {
            if(this.state.isbn.length !== 13){
                console.log('here 2');
                return;
            }
            for(var i=0; i<this.state.isbn.length; i++){
                if(!parseInt(this.state.isbn[i]) && parseInt(this.state.isbn[i]) !== 0){
                    console.log('here 3');
                    return;
                }
            }

            var numPeriods = 0;
            for(var i=0; i<this.state.price.length; i++){
                if(!(!Number.isNaN(parseInt(this.state.price[i])) || this.state.price[i] === '.')){
                    console.log('here 4');
                    return;
                }
                else if(this.state.price[i] === '.'){
                    console.log('here 5');
                    numPeriods += 1;
                    if(numPeriods > 1){
                        return;
                    }
                }
            }
            if(this.state.price.split('.').length > 1 && this.state.price.split('.')[1].length > 2){
                console.log('here 6');
                return;
            }
        }

        const db = firebase.firestore();
        var docName;
        var code = this.state.code;
        db.collection('Groups').doc(code).collection('Listings').where('isbn', '==', this.state.isbn).get().then((snapshot) => {
            docName = snapshot['size'] === 0 ? this.state.isbn : (snapshot['size'] === 1 ? (this.state.isbn + snapshot['size'].toString()) : (this.state.isbn + (parseInt(snapshot.docs[snapshot['size'] - 1].id.substring(13, snapshot.docs[snapshot['size'] - 1].id.length)) + 1)));
        }).then(() => {
            db.collection('Groups').doc(code).collection('Listings').doc(docName).set({
                author: this.state.author,
                buyer: '',
                isbn: this.state.isbn,
                name: this.state.title,
                seller: this.props.user['email'],
                sold: false,
                price: parseFloat(this.state.price),
                description: this.state.desc,
                requests: [],
                condition: this.state.condition,
                categories: this.state.categories,
                buyerapproval: false,
                sellerapproval: false,
                acceptancedate: '',
                group: code,
                pimage: 'listingPics/' + code + docName + '.jpg'
            }).then(() => {
                firebase.storage().ref().child('listingPics/' + code + docName).put(this.state.file, {contentType: 'application/octet-strem'}).then(() => {
                    this.setState({
                        redirect: true
                    });
                });
            });
        });
    }

    handleChangeSearch(event) {
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

    handleSubmitSearch(event){
        event.preventDefault();

        if(event.target.value !== ''){
            this.setState({
                searching: true
            });
        }
    }

    onFileChange(event){
        var target = event.target;
        this.setState({
            file: target.files[0]
        });
    }

    render() {
        var search = "?q=" + this.state.search;
        var styling = {
            'backgroundImage': 'url(' + background + ')'
        };
        return (
            <div className="createListing">
                {this.state.redirect ?
                    <Redirect to="/" />
                    :
                    <React.Fragment>
                        <NavBar member={this.props.user['email']} books={this.state.books} handleChange={this.handleChangeSearch} handleSubmit={this.handleSubmitSearch} />
                        {this.state.searching ?
                            <Redirect to={{
                                pathname: "/search",
                                search: search
                            }} />
                            :
                            <div className="createListingContentAndHeader">
                                <Header as='h1' icon className="pageHeader">
                                    <Icon name='pencil' />
                                    Create Listing
                                </Header>
                                <div className="createListingContent">
                                    <Form className="createListingForm">
                                        <div className="createListingFormContent">
                                            <div  className="createListingColumn1">
                                                <TextField label="Title" type="title" placeholder="Book's Title" onChange={this.handleChange} />
                                                <TextField label="ISBN" type="isbn" placeholder="Book's 13 Digit ISBN" onChange={this.handleChange} />
                                                <TextField label="Author" type="author" placeholder="Book's Author" onChange={this.handleChange} />
                                                <TextField label="Description" type="desc" placeholder="Book's Description" onChange={this.handleChange} />
                                                <TextField label="Price" type="price" placeholder="Book's Price" onChange={this.handleChange} />
                                            </div>
                                            <div className="createListingColumn2">
                                                <React.Fragment>
                                                    <Button as='div' labelPosition='right' className="createListingChooseFile">
                                                        <Button onClick={() => this.fileRef.current.click()}>
                                                            <Icon name="file" />
                                                        </Button>
                                                        <Label as='p' basic pointing='left'>
                                                            {this.state.file === null ? "Choose File" : this.state.file.name}
                                                        </Label>
                                                    </Button>
                                                    <input
                                                        ref={this.fileRef}
                                                        type="file"
                                                        hidden
                                                        onChange={this.onFileChange}
                                                        accept="image/jpeg"
                                                    />
                                                    <br />
                                                </React.Fragment>
                                                <Dropdown
                                                    placeholder="Condition"
                                                    selection
                                                    options={[
                                                        {
                                                            key: 'New',
                                                            text: 'New',
                                                            value: 'New'
                                                        },
                                                        {
                                                            key: 'Good',
                                                            text: 'Good',
                                                            value: 'Good'
                                                        },
                                                        {
                                                            key: 'Fair',
                                                            text: 'Fair',
                                                            value: 'Fair'
                                                        },
                                                        {
                                                            key: 'Poor',
                                                            text: 'Poor',
                                                            value: 'Poor'
                                                        }
                                                    ]}
                                                    onChange={this.handleChange}
                                                    className="createListingDropDown"
                                                ></Dropdown>
                                                <div className="createListingRadioButtons">
                                                    {this.state.groupRadioButtons}
                                                </div>
                                            </div>
                                        </div>
                                        <Button onClick={this.handleSubmit} className="createListingSubmitButton">
                                            <Icon name="send" />
                                            Submit
                                        </Button>
                                    </Form>
                                    <div className="createListingWrapper" style={styling}>
                                    </div>
                                </div>
                            </div>
                        }
                    </React.Fragment>
                }
            </div>
        );
    }
}
