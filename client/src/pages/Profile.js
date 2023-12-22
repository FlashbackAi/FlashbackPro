import React from 'react';
import { div } from 'prelude-ls';
import '../Profile.css'
import logoImage from '../Media/logo.png';
import Avatar from 'react-avatar'


const Profile = () => {
  // Retrieve user details from sessionStorage or wherever you store them
  const username = sessionStorage.getItem('username');
  const email = sessionStorage.getItem('email');
  const phoneNumber = sessionStorage.getItem('phoneNumber');
//const spinPoints = "M13,3a7,7,0,0,0,0,14A5,5,0,0,0,13,7a3,3,0,0,0,0,6,1,1,0,0,0,0-2,1,1,0,0,1,0-2,3,3,0,0,1,0,6A5,5,0,0,1,13,5a7,7,0,0,1,0,14,9,9,0,0,1-9-9,1,1,0,0,0-2,0A11,11,0,0,0,13,21,9,9,0,0,0,13,3Z";

  return (
    <>
    
    <div className="user-header-wrapper flexbox">
        <div className="user-header-inner flexbox">
            <div className="user-header-overlay"></div>
        </div>
    </div>
    <div className="user-info-bar">
        <div className="ufo-bar-col1"></div>
        <div className="ufo-bar-col2">
            <div className="ufo-bar-col2-inner">
                <div className="user-icon-wrapper">
                    <Avatar name = {username} size = "120" square green/>
                </div>
            </div>
        </div>
        <div className="ufo-bar-col3">
            <div className="ufo-bar-col3-inner">
                <div className="username-wrapper-outer">
                    <div className="username-wrapper">
                        <h1 className="username-dev">{username}</h1>
                    </div>
                </div>
            </div>
        </div>
        <div className="ufo-bar-col4">
            <div className="ufo-bar-col4-inner">
                <button className="button2 btn-primary2" ><i className="uil uil-plus"></i><a href="/createFlashback">Flashback</a><div className="btn-secondary2"></div></button>
            </div>
        </div>
        <div className="ufo-bar-col5"></div>
    </div>
    <div className="user-info-bar2">
        <div className="ufo-bar2-col1"></div>
        <div id="ufo-home" className="ufo-bar2-col2 ufo-bar2-block">
            <div className="ufo-bar2-col2-inner flexbox">
                <span><i className="uil uil-Referrals"></i></span>
                <h3>Referrals</h3>
            </div>
        </div>
        <div id="ufo-videos" className="ufo-bar2-col3 ufo-bar2-block">
            <div className="ufo-bar2-col3-inner flexbox">
                <span><i className="uil uil-Flashbacks"></i></span>
                <h3>Flashbacks</h3>
            </div>
        </div>
        <div id="ufo-images" className="ufo-bar2-col4 ufo-bar2-block">
            <div className="ufo-bar2-col4-inner flexbox">
                <span><i className="uil uil-Orders"></i></span>
                <h3>Orders</h3>
            </div>
        </div>
        <div id="ufo-about" className="ufo-bar2-col6 ufo-bar2-block">
            <div className="ufo-bar2-col6-inner flexbox">
                <span><i className="uil uil-Rewards"></i></span>
                <h3>Rewards</h3>
            </div>
        </div>
        
    </div>
<>
<footer id="footer" className="flexbox-col">
    <div className="footer-logo-wrapper flexbox">
    </div>
    <div className="footer-inner flexbox">
        <div className="footer-left">
            
            <a className="footer-mail">Find us everywhere.</a>
        </div>
        <div className="footer-right">
            <div className="footer-links">
                <a className="footer-link fl-first" href="" target="_blank">X.</a>
                <a className="footer-link" href="https://www.instagram.com/flashback_inc/" target="_blank">Instagram.</a>
                <a className="footer-link" href="" target="_blank">Meta.</a>
                <a className="footer-link" href="" target="_blank">Discord.</a>
                <a className="footer-link fl-last" href="https://www.linkedin.com/company/flashbackinc/" target="_blank">LinkedIn.</a>
            </div>
        </div>
    </div>
</footer>
</>
</>

  );
};


export default Profile;

