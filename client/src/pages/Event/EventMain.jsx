// import React, { useState } from 'react';
// import Header from '../../components/Header/Header';
// import Footer from '../../components/Footer/Footer';
// import './EventMain.css';
// import Event from './Event';
// import { Link } from 'react-router-dom';

// const EventMain = () => {
//   const [content, setContent] = useState('myEvents');

//   const renderContent = () => {
//     switch (content) {
//       case 'myEvents':
//         return <Event />;
//       case 'attendEvents':
//         return <div>My Uploads</div>;
//       case 'orders':
//         return <div>Attended Events</div>;
//       default:
//         return <Event />;
//     }
//   };

//   return (
//     <div className='event-main-wrapper'>
//       <Header />
//       <div className='event-main-content'>
//         {renderContent()}
//       </div>
//       <div className='event-bottom-buttons'>
//         <button className='event-buttons' onClick={() => setContent('myEvents')}>My Projects</button>
//         <button className='event-buttons' onClick={() => setContent('attendEvents')}>My Uploads</button>
//         <button className='event-buttons' onClick={() => setContent('orders')}>Attended Events</button>
//       </div>
//     </div>
//   );
// }

// export default EventMain;
