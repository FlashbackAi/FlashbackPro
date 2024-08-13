// // import React, { useContext } from "react";
// // import axios from "axios";
// // import { useEffect, useState } from "react";
// // import { Link, useHistory } from "react-router-dom";
// // //import ThumbUpAltIcon from "@material-ui/icons/ThumbUpAlt";
// // import { AuthContext } from "../helpers/AuthContext";

// function Home() {
// //   const [listOfPosts, setListOfPosts] = useState([]);
// //   const [likedPosts, setLikedPosts] = useState([]);
// //   const { authState } = useContext(AuthContext);
// //   let history = useHistory();

// //   useEffect(() => {
// //     if (!localStorage.getItem("accessToken")) {
// //       history.push("/login");
// //     } else {
// //       axios
// //         .get("http://localhost:3001/posts", {
// //           headers: { accessToken: localStorage.getItem("accessToken") },
// //         })
// //         .then((response) => {
// //           setListOfPosts(response.data.listOfPosts);
// //           setLikedPosts(
// //             response.data.likedPosts.map((like) => {
// //               return like.PostId;
// //             })
// //           );
// //         });
// //     }
// //   }, []);

// //   const likeAPost = (postId) => {
// //     axios
// //       .post(
// //         "http://localhost:3001/likes",
// //         { PostId: postId },
// //         { headers: { accessToken: localStorage.getItem("accessToken") } }
// //       )
// //       .then((response) => {
// //         setListOfPosts(
// //           listOfPosts.map((post) => {
// //             if (post.id === postId) {
// //               if (response.data.liked) {
// //                 return { ...post, Likes: [...post.Likes, 0] };
// //               } else {
// //                 const likesArray = post.Likes;
// //                 likesArray.pop();
// //                 return { ...post, Likes: likesArray };
// //               }
// //             } else {
// //               return post;
// //             }
// //           })
// //         );

// //         if (likedPosts.includes(postId)) {
// //           setLikedPosts(
// //             likedPosts.filter((id) => {
// //               return id != postId;
// //             })
// //           );
// //         } else {
// //           setLikedPosts([...likedPosts, postId]);
// //         }
// //       });
// //   };

// //   return (
// //     <div>
// //       {listOfPosts.map((value, key) => {
// //         return (
// //           <div key={key} className="post">
// //             <div className="title"> {value.title} </div>
// //             <div
// //               className="body"
// //               onClick={() => {
// //                 history.push(`/post/${value.id}`);
// //               }}
// //             >
// //               {value.postText}
// //             </div>
// //             <div className="footer">
// //               <div className="username">
// //                 <Link to={`/profile/${value.UserId}`}> {value.username} </Link>
// //               </div>
// //               <div className="buttons">
// //                 <ThumbUpAltIcon
// //                   onClick={() => {
// //                     likeAPost(value.id);
// //                   }}
// //                   className={
// //                     likedPosts.includes(value.id) ? "unlikeBttn" : "likeBttn"
// //                   }
// //                 />

// //                 <label> {value.Likes.length}</label>
// //               </div>
// //             </div>
// //           </div>
// //         );
// //       })}
// //     </div>
// //   );
// return (
//     <div style={{ textAlign: 'center', paddingTop: '50px', fontSize: '24px', color: 'green' }}>
//       Congratulations!! You are successfully registered for the event
//     </div>
//   );
  
// }



// export default Home;

import React from 'react'
//import useWindowSize from 'react-use/lib/useWindowSize'
import Confetti from 'react-confetti'
import logo from "../../media/images/logoCropped.png"
import Header from '../../components/Header/Header';

function Home () {
  //const { width, height } = useWindowSize()
  return (
    <div className="loginBody">
    <div className="loginLeft">
    

    <Confetti opacity="0.7" friction="0.95 "
    />
     {/* <Header dontshowredeem={true}/> */}
    {/* <p className="loginLogo">Flashback<p className="logoCaption">Create & share memories</p></p> */}
    <p className="Congrats"> Congratulations!! <br/><br/>You are successfully registered for the event!  </p>
        <p> </p>
    <p className="CongratsMessage"> 
    {/* style={{ textAlign: 'center', paddingTop: '50px', fontSize: '30px', color: 'green' }}> */}
        Standby for a message from us on Whatsapp with your Pictures.
    </p>
    </div>
    </div>

  )
}

export default Home;
