import EventModel from '../models/event.mjs';

const Events = class Events {
  constructor(app, connect) {
    this.app = app;
    this.EventModel = connect.model('Event', EventModel);
    this.run();
  }


  create() {
    this.app.post('/event', async (req, res) => {
      try {
        const event = new this.EventModel(req.body);
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
      } catch (err) {
        console.error(`[ERROR] events/create -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  getAll() {
    this.app.get('/events', async (req, res) => {
      try {
        const events = await this.EventModel.find()
          .populate('organizers', 'firstname lastname email')
          .populate('participants', 'firstname lastname email');
        res.status(200).json(events);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }


  getById() {
    this.app.get('/event/:id', async (req, res) => {
      try {
        const event = await this.EventModel.findById(req.params.id)
          .populate('organizers', 'firstname lastname email')
          .populate('participants', 'firstname lastname email');

        if (!event) {
          return res.status(404).json({ code: 404, message: 'Event Not Found' });
        }

        res.status(200).json(event);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }


  deleteById() {
    this.app.delete('/event/:id', async (req, res) => {
      try {
        const deleted = await this.EventModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }


  addParticipant() {
    this.app.patch('/event/:id/addParticipant', async (req, res) => {
      try {
        const { userId } = req.body;
        const event = await this.EventModel.findById(req.params.id);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (!event.participants.includes(userId)) {
          event.participants.push(userId);
          await event.save();
        }

        res.status(200).json(event);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }


  removeParticipant() {
    this.app.patch('/event/:id/removeParticipant', async (req, res) => {
      try {
        const { userId } = req.body;
        const event = await this.EventModel.findById(req.params.id);

        if (!event) return res.status(404).json({ message: 'Event not found' });

        event.participants = event.participants.filter(id => id.toString() !== userId);
        await event.save();

        res.status(200).json(event);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.deleteById();
    this.addParticipant();
    this.removeParticipant();
  }
};

export default Events;
