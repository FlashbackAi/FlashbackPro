import React from 'react';
import { div } from 'prelude-ls';
import '../Profile.css'
import logoImage from '../Media/logo.png';


const Profile = () => {
  // Retrieve user details from sessionStorage or wherever you store them
  const username = sessionStorage.getItem('username');
  const email = sessionStorage.getItem('email');
  const phoneNumber = sessionStorage.getItem('phoneNumber');

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
                    <img className="user-icon" src={logoImage} alt="" />
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
                <button className="button2 btn-primary2" ><i className="uil uil-plus"></i><a href="/createFlashback"> Flashback</a> <div className="btn-secondary2"></div></button>
            </div>
        </div>
        <div className="ufo-bar-col5"></div>
    </div>
    <div className="user-info-bar2">
        <div className="ufo-bar2-col1"></div>
        <div id="ufo-home" className="ufo-bar2-col2 ufo-bar2-block">
            <div className="ufo-bar2-col2-inner flexbox">
                <span><i className="uil uil-trophy"></i></span>
                <h3>Trophies</h3>
            </div>
        </div>
        <div id="ufo-videos" className="ufo-bar2-col3 ufo-bar2-block">
            <div className="ufo-bar2-col3-inner flexbox">
                <span><i className="uil uil-star"></i></span>
                <h3>Points</h3>
            </div>
        </div>
        <div id="ufo-images" className="ufo-bar2-col4 ufo-bar2-block">
            <div className="ufo-bar2-col4-inner flexbox">
                <span><i className="uil uil-comment-alt"></i></span>
                <h3>Posts</h3>
            </div>
        </div>
        <div id="ufo-about" className="ufo-bar2-col6 ufo-bar2-block">
            <div className="ufo-bar2-col6-inner flexbox">
                <span><i className="uil uil-user"></i></span>
                <h3>About</h3>
            </div>
        </div>
        
    </div>
<>
<footer id="footer" className="flexbox-col">
    <div className="footer-logo-wrapper flexbox">
        <svg className="footer-logo" xmlns="http://www.w3.org/2000/svg" id="Layer_2" data-name="Layer 2" viewBox="0 0 805.93 1044.03">
            <defs><style>{`.cls-4{fill:none;stroke:var(--bc-purple);stroke-miterlimit:10;stroke-width:45px;}.cls-5{font-size:92.32px;fill:var(--bc-purple);font-family:DINPro, DIN Pro;letter-spacing:0.26em;}.cls-5{letter-spacing:0.28em;}`}</style></defs>
            <title>icon-wtext</title>
            <polyline className="cls-4" points="518.08 328.59 783.43 177.13 783.43 39 401.75 258.32 22.5 39 22.5 183.8 588.35 507.92 510.81 553.96 783.43 706.63 783.43 839.92 402.97 621.82 22.5 839.92 22.5 707.85 386 497.02" />
            <text className="cls-5" transform="translate(187.07 1022.89)">Flashback Inc.<tspan className="cls-5" x="74.41" y="0"></tspan></text>
        </svg>
    </div>
    <div className="footer-inner flexbox">
        <div className="footer-left">
            <svg className="footer-ico" src="..\Media\svg\GrayscaleTransparent.svg" id="Layer_2" data-name="Layer 2" viewBox="0 0 805.93 878.75">
                <defs><style>{`.cls-1{fill:none;stroke:var(--primary);stroke-miterlimit:10;stroke-width:45px;}`}</style></defs>
                <title>icon</title>
                <polyline className="cls-1" points="518.08 328.59 783.43 177.13 783.43 39 401.75 258.32 22.5 39 22.5 183.8 588.35 507.92 510.81 553.96 783.43 706.63 783.43 839.92 402.97 621.82 22.5 839.92 22.5 707.85 386 497.02" />
            </svg>
            <a className="footer-mail">Find us everywhere.</a>
        </div>
        <div className="footer-right">
            <div className="footer-links">
                <a className="footer-link fl-first" href="" target="_blank">Twitter.</a>
                <a className="footer-link" href="" target="_blank">Instagram.</a>
                <a className="footer-link" href="" target="_blank">Discord.</a>
                <a className="footer-link fl-last" href="" target="_blank">LinkedIn.</a>
            </div>
        </div>
    </div>
</footer>
</>
</>

  );
};


export default Profile;

