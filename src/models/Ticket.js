class Ticket {
   constructor(id, title, tags, userId, status, priority) {
      this.id = id;
      this.title = title;
      this.tags = tags;
      this.userId = userId;
      this.status = status;
      this.priority = priority;
   }
}

export default Ticket;