import React from 'react'
import { connect } from 'react-redux'
import { NavLink } from 'react-router-dom'
import $ from 'jquery'
import './style.css'
class Home extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            image: "",
            message: "",
            bitToAddMore: ["0", "0", "00", "000", "0000", "00000", "000000"],
            tmpMessage: "",
            added: false
        }
    }

    componentDidMount() {


    }
    rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }
    string2Bin(str) {
        var result = [];
        for (var i = 0; i < str.length; i++) {
            result.push((this.state.bitToAddMore[8 - str.charCodeAt(i).toString(2).length]) + str.charCodeAt(i).toString(2));
        }
        return result;
    }

    bin2String(array) {
        var stringArray = [];
        for (var i = 0; i < array.length; i++) {
            stringArray.push(String.fromCharCode(parseInt(array[i], 2)));
        }
        return stringArray;
    }

    changeLastBit(num, bit) {
        var binArray = num.toString(2);
        binArray = binArray.substr(0, binArray.length - 1) + bit;
        return parseInt(binArray, 2);
    }

    getPixelVaule(x, y, canvas, k) {
        if (k === 1) {
            var string = canvas.getContext('2d').getImageData(x, y, 1, 1).data[0].toString(2);
            return string.substr(string.length - 1, string.length);
        } else {
            var string1 = canvas.getContext('2d').getImageData(x, y, 1, 1).data[0].toString(2);
            var string2 = canvas.getContext('2d').getImageData(x, y, 1, 1).data[1].toString(2);
            return string1.substr(string1.length - 1, string1.length) + string2.substr(string2.length - 1, string2.length);;
        }
    }

    addMessage(event) {
        var img = document.getElementById('my-image');
        var canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        if (this.state.message === "No message in this image!" || this.state.message === "Please type your message here!") {
            this.setState({
                message: "Please type your message here!"
            })
            return
        }
        var str = "SecretLeter" + this.state.message + "/n";

        var binMessage = this.string2Bin(str);

        var break1 = false, break2 = false;
        var x = 0, y = 0;
        for (var i = 0; i < img.width && break1 === false; i++) {
            for (var j = 0; j < img.height && break2 === false; j++) {
                var pixelData = canvas.getContext('2d').getImageData(i, j, 1, 1).data;
                if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0 && pixelData[3] === 0) {
                }
                else {
                    canvas.getContext('2d').fillStyle = "rgba(" + this.changeLastBit(pixelData[0], binMessage[x].charAt(y)) + "," + this.changeLastBit(pixelData[1], binMessage[x].charAt(y + 1)) + "," + pixelData[2] + "," + pixelData[3] + ")";
                    canvas.getContext('2d').fillRect(i, j, 1, 1);
                    y += 2;
                    if (y > 7) {
                        y = 0;
                        x++;
                        if (x === binMessage.length) {
                            break2 = true;
                            break1 = true;
                        }
                    }
                }
            }
        }
        var newCanvas = document.getElementById("new-image");
        newCanvas.width = canvas.width;
        newCanvas.height = canvas.height;
        newCanvas.getContext('2d').drawImage(canvas, 0, 0);
        this.setState({
            added: true
        })
    }

    download() {
        $(".notify").text("");
        if (this.state.added) {
            var canvas = document.getElementById("new-image");
            var link = document.createElement('a');
            link.download = "test.png";
            link.href = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");;
            link.click();
        }
        else {
            $(".notify").text("No image to download!");
        }
    }

    readMessage() {
        var canvas = document.createElement('canvas');
        var img = document.getElementById('my-image');
        canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
        var break1 = false, break2 = false;
        var value = "";
        var charValue = "";
        var check = 0;
        var endMessage = "";
        var x = 0;
        for (var i = 0; i < img.width && break1 === false; i++) {
            for (var j = 0; j < img.height && break2 === false; j++) {
                var pixelData = canvas.getContext('2d').getImageData(i, j, 1, 1).data;
                if (pixelData[0] === 0 && pixelData[1] === 0 && pixelData[2] === 0 && pixelData[3] === 0) {

                } else {
                    charValue += this.getPixelVaule(i, j, canvas, 2);
                    x++;
                    if (x > 3) {
                        x = 0;
                        value += String.fromCharCode(parseInt(charValue, 2));
                        if (String.fromCharCode(parseInt(charValue, 2)) === "/") {
                            endMessage = "/";
                        }
                        if (String.fromCharCode(parseInt(charValue, 2)) === "n" && endMessage === "/") {
                            break1 = break2 = true;
                        }
                        charValue = "";
                        check++;
                        if (check > 10) {
                            if (value.indexOf("SecretLeter") === 0) {
                                continue;
                            }
                            else {
                                value = "SecretLeterNo message in this image!/n"
                                break1 = break2 = true;
                            }
                        }
                    }
                }
            }
        }
        break1 = false;
        break2 = false;
        return value;
    }

    resetMessage() {
        if (this.state.message === "No message in this image!" || this.state.message === "Please type your message here!") {
            this.setState({
                tmpMessage: this.state.message,
                message: ""
            })
        }
    }

    reverseMassage() {
        if (this.state.message === "") {
            this.setState({
                message: this.state.tmpMessage,
                tmpMessage: ""
            })
        }
    }


    onImageChange(event) {
        $(".notify").text("");
        this.setState({
            message: "Wating...",
            loaded: false
        })
        if (event.target.files && event.target.files[0]) {
            console.log(event.target.files)
            let reader = new FileReader();
            reader.onload = (e) => {
                this.setState({ image: e.target.result });
                var canvas = document.createElement('canvas');
                var img = document.getElementById('my-image');
                canvas.getContext('2d').drawImage(img, 0, 0, img.width, img.height);
                var secretMessage = ""
                setTimeout(() => {
                    secretMessage = this.readMessage();
                    this.setState({
                        message: secretMessage.substr(11, secretMessage.length - 13)
                    })
                }, 1000);
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    }

    render() {
        const {
            title,
            message,
            image
        } = this.state;


        return (
            <div className="home-page">
                <span className="name">LSB</span>
                <div className="your-image">
                    <div className="header-input">
                        <input type="file" onChange={this.onImageChange.bind(this)} className="filetype" id="group_image" accept="image/*" />
                    </div>
                    <div className="content-input">
                        <div className="image-input" style={{ background: (image.length === 0) ? ("url(" + require("../../app/image/default_image.png") + ")") : "", backgroundSize: "cover", width: "100%", backgroundPosition: "50% 50%" }}>
                            <img id="my-image" src={this.state.image} />
                        </div>
                        <div className="message-input">
                            <textarea id="message" value={message} onChange={(e) => this.setState({ message: e.target.value })} onClick={this.resetMessage.bind(this)} onBlur={this.reverseMassage.bind(this)} />
                        </div>
                        <span onClick={this.addMessage.bind(this)}>Add message to your image</span>
                    </div>
                </div>
                <div class="right">
                    <div className="out-put">
                        <div className="out-put-title">
                            <span>Output Image</span>
                        </div>
                        <canvas id="new-image" />
                        <span className="notify"></span>
                        <a href="#" id="downloader" onClick={this.download.bind(this)} download="image.png">Download!</a>
                    </div>
                    <div className="info">
                        <span>Văng Đăng Khoa</span>
                        <span>N14DCAT046</span>
                    </div>
                </div>
            </div>
        )
    }
}
export default Home