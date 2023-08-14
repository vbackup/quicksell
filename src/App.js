import React, { useState, useEffect } from 'react';
import './App.css';

import Ticket from './models/Ticket';
import User from './models/User';

import styles from './styles/App.module.css';
import ticketStyles from './styles/Ticket.module.css';

function App() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedView, setSelectedView] = useState('status');
  const [selectedSort, setSelectedSort] = useState('priority');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');

    fetch('https://apimocha.com/quicksell/data', {
      method: 'GET',
      headers: headers,
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(responseData => {
        const ticketData = responseData.tickets.map(ticket => (
          new Ticket(ticket.id, ticket.title, ticket.tag, ticket.userId, ticket.status, ticket.priority)
        ));

        const userData = responseData.users.map(user => (
          new User(user.id, user.name, user.available)
        ));

        setTickets(ticketData);
        setUsers(userData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setError('An error occurred while fetching data.');
        setLoading(false);
      });
  }, []);

  const groupedTickets = {};

  if (selectedView === 'status') {
    tickets.forEach(ticket => {
      if (!groupedTickets[ticket.status]) {
        groupedTickets[ticket.status] = [];
      }
      groupedTickets[ticket.status].push(ticket);
    });
  } else if (selectedView === 'user') {
    users.forEach(user => {
      groupedTickets[user.id] = tickets.filter(ticket => ticket.userId === user.id);
    });
  } else if (selectedView === 'priority') {
    tickets.forEach(ticket => {
      if (!groupedTickets[ticket.priority]) {
        groupedTickets[ticket.priority] = [];
      }
      groupedTickets[ticket.priority].push(ticket);
    });
  }

  // Sorting function based on selectedSort
  const sortFunction = (a, b) => {
    if (selectedSort === 'priority') {
      return b.priority - a.priority;
    } else if (selectedSort === 'title') {
      return a.title.localeCompare(b.title);
    }
    return 0;
  };

  return (
    <div className={styles.App}>
      <header className={styles['App-header']}>
        <h1>Kanban App</h1>
        <div className={styles.selectors}>
          <label htmlFor="viewSelect">Group by: </label>
          <select
            id="viewSelect"
            value={selectedView}
            onChange={(e) => setSelectedView(e.target.value)}
          >
            <option value="status">Status</option>
            <option value="user">User</option>
            <option value="priority">Priority</option>
          </select>
        </div>
        <div className={styles.selectors}>
          <label htmlFor="sortSelect">Sort by: </label>
          <select
            id="sortSelect"
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
          >
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </div>
      </header>
      <main className={styles['App-main']}>
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          Object.keys(groupedTickets).map(groupKey => (
            <div key={groupKey}>
              <h2>{groupKey}</h2>
              <ul>
                {groupedTickets[groupKey].sort(sortFunction).map(ticket => (
                  <li key={ticket.id} className={ticketStyles.ticket}>
                    <div className={ticketStyles.title}>{ticket.title}</div>
                    <div className={ticketStyles.status}>Status: {ticket.status}</div>
                    <div className={ticketStyles.priority}>Priority: {ticket.priority}</div>
                    <div>User: {users.find(user => user.id === ticket.userId)?.name}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </main>
    </div>
  );
}

export default App;
