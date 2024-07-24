// // import React, { useState } from 'react';
// // import './EventSelector.css';

// // const events = [
// //   {
// //     name: 'Marriage',
// //     imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVXLORoOIYOHUcaRsTf6UZ6spOxOKLgY-_MA&s'
// //   },
// //   {
// //     name: 'Birthday',
// //     imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZo0EX31scT-hCjJXzMxAjO58eUs4Rb8V2NQ&s'
// //   },
// //   {
// //     name: 'Others',
// //     imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFS0iTBuEPAgYjz5AZ8dRpCBJqpuX4ieEvxQ&s'
// //   }
// // ];

// // const subEvents = [
// //   {
// //     name: 'Haldi',
// //     imgUrl: 'https://static.vecteezy.com/system/resources/previews/022/976/571/original/happy-couple-in-haldi-ceremony-free-vector.jpg'
// //   },
// //   {
// //     name: 'Engagement',
// //     imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs1cPMxL-5vzpFtU3ce73WB7hQnh7QjGf_Zw&s'
// //   },
// //   {
// //     name: 'Marriage',
// //     imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT77Bk3M2MO5xPwq9IOHUABN9-_-l_XAnyRrA&s'
// //   },
// //   {
// //     name: 'Reception',
// //     imgUrl: 'https://static.vecteezy.com/system/resources/previews/038/242/443/non_2x/cute-indian-couple-cartoon-in-traditional-dress-posing-for-wedding-invitation-card-design-free-vector.jpg'
// //   }
// // ];

// // const EventSelector = () => {
// //   const [selectedEvent, setSelectedEvent] = useState(null);
// //   const [selectedSubEvents, setSelectedSubEvents] = useState([]);

// //   const handleEventClick = (event) => {
// //     setSelectedEvent(event);
// //     setSelectedSubEvents([]); // Reset sub-event selection
// //   };

// //   const handleSubEventClick = (subEvent) => {
// //     setSelectedSubEvents(prevState =>
// //       prevState.includes(subEvent)
// //         ? prevState.filter(event => event !== subEvent)
// //         : [...prevState, subEvent]
// //     );
// //   };

// //   return (
// //     <div className='event-selector-wrapper'>
// //       <h1>Please Select the event</h1>
// //       <div className="event-selector-cards">
// //         {events.map((event) => (
// //           <div
// //             key={event.name}
// //             className={`event-selector-card ${selectedEvent === event.name ? 'selected' : ''}`}
// //             onClick={() => handleEventClick(event.name)}
// //           >
// //             <img src={event.imgUrl} alt={event.name} />
// //             <div className="card-label">{event.name}</div>
// //             {selectedEvent === event.name && <span className="tick">✔</span>}
// //           </div>
// //         ))}
// //       </div>

// //       {selectedEvent === 'Marriage' && (
// //         <>
// //         <h2>Please select the sub event</h2>
// //         <div className="sub-event-selector-cards">
// //           {subEvents.map((subEvent) => (
// //             <div
// //               key={subEvent.name}
// //               className={`sub-event-selector-card ${selectedSubEvents.includes(subEvent.name) ? 'selected' : ''}`}
// //               onClick={() => handleSubEventClick(subEvent.name)}
// //             >
// //               <img src={subEvent.imgUrl} alt={subEvent.name} />
// //               <div className="card-label">{subEvent.name}</div>
// //               {selectedSubEvents.includes(subEvent.name) && <span className="tick">✔</span>}
// //             </div>
// //           ))}
// //         </div>
// //         </>
// //       )}

// //       {selectedSubEvents.length > 0 && (
// //         <button className="next-button">Next</button>
// //       )}
// //     </div>
// //   );
// // }

// // export default EventSelector;

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './EventSelector.css';

const events = [
  {
    name: 'Marriage',
    imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRVXLORoOIYOHUcaRsTf6UZ6spOxOKLgY-_MA&s'
  },
  {
    name: 'Birthday',
    imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZo0EX31scT-hCjJXzMxAjO58eUs4Rb8V2NQ&s'
  },
  {
    name: 'Others',
    imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFS0iTBuEPAgYjz5AZ8dRpCBJqpuX4ieEvxQ&s'
  }
];

const subEvents = [
  {
    name: 'Haldi',
    imgUrl: 'https://static.vecteezy.com/system/resources/previews/022/976/571/original/happy-couple-in-haldi-ceremony-free-vector.jpg'
  },
  {
    name: 'Engagement',
    imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs1cPMxL-5vzpFtU3ce73WB7hQnh7QjGf_Zw&s'
  },
  {
    name: 'Marriage',
    imgUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT77Bk3M2MO5xPwq9IOHUABN9-_-l_XAnyRrA&s'
  },
  {
    name: 'Reception',
    imgUrl: 'https://static.vecteezy.com/system/resources/previews/038/242/443/non_2x/cute-indian-couple-cartoon-in-traditional-dress-posing-for-wedding-invitation-card-design-free-vector.jpg'
  }
];

const EventSelector = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedSubEvents, setSelectedSubEvents] = useState([]);
  const location = useLocation();
  const userName = location.state?.userName;
  const navigate = useNavigate();

  console.log(userName);

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setSelectedSubEvents([]); // Reset sub-event selection
  };

  const handleSubEventClick = (subEvent) => {
    setSelectedSubEvents(prevState =>
      prevState.includes(subEvent)
        ? prevState.filter(event => event !== subEvent)
        : [...prevState, subEvent]
    );
  };

  const handleNextClick = () => {
    console.log(selectedEvent);
    navigate('/createEventForm', {
      state: {
        selectedEvent,
        selectedSubEvents,
        userName,
      }
    });
  };

  console.log(selectedEvent);

  return (
    <div className='event-selector-wrapper'>
      <h1>Please Select the Project</h1>
      <div className="event-selector-cards">
        {events.map((event) => (
          <div
            key={event.name}
            className={`event-selector-card ${selectedEvent === event.name ? 'selected' : ''}`}
            onClick={() => handleEventClick(event.name)}
          >
            <img src={event.imgUrl} alt={event.name} />
            <div className="card-label">{event.name}</div>
            {selectedEvent === event.name && <span className="tick">✔</span>}
          </div>
        ))}
      </div>

      {selectedEvent === 'Marriage' && (
        <>
          <h2>Please select the Event</h2>
          <div className="sub-event-selector-cards">
            {subEvents.map((subEvent) => (
              <div
                key={subEvent.name}
                className={`sub-event-selector-card ${selectedSubEvents.includes(subEvent.name) ? 'selected' : ''}`}
                onClick={() => handleSubEventClick(subEvent.name)}
              >
                <img src={subEvent.imgUrl} alt={subEvent.name} />
                <div className="card-label">{subEvent.name}</div>
                {selectedSubEvents.includes(subEvent.name) && <span className="tick">✔</span>}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedSubEvents.length > 0 && (
        <button className="next-button" onClick={handleNextClick}>Next</button>
      )}
    </div>
  );
}

export default EventSelector;

