import GroupModel from '../models/group.mjs';

const Groups = class Groups {
  constructor(app, connect) {
    this.app = app;
    this.GroupModel = connect.model('Group', GroupModel);
    this.run();
  }

  create() {
    this.app.post('/group', async (req, res) => {
      try {
        const group = new this.GroupModel(req.body);
        const savedGroup = await group.save();
        res.status(201).json(savedGroup);
      } catch (err) {
        console.error(`[ERROR] groups/create -> ${err}`);
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }


  getAll() {
    this.app.get('/groups', async (req, res) => {
      try {
        const groups = await this.GroupModel.find()
          .populate('admins', 'firstname lastname email')
          .populate('members', 'firstname lastname email');
        res.status(200).json(groups);
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }


  getById() {
    this.app.get('/group/:id', async (req, res) => {
      try {
        const group = await this.GroupModel.findById(req.params.id)
          .populate('admins', 'firstname lastname email')
          .populate('members', 'firstname lastname email');
        res.status(200).json(group || {});
      } catch (err) {
        res.status(404).json({ code: 404, message: 'Group Not Found' });
      }
    });
  }

  addMember() {
    this.app.patch('/group/:id/addMember', async (req, res) => {
      try {
        const { userId } = req.body;
        const group = await this.GroupModel.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        if (!group.members.includes(userId)) {
          group.members.push(userId);
          await group.save();
        }

        res.status(200).json(group);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  removeMember() {
    this.app.patch('/group/:id/removeMember', async (req, res) => {
      try {
        const { userId } = req.body;
        const group = await this.GroupModel.findById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        group.members = group.members.filter(id => id.toString() !== userId);
        await group.save();

        res.status(200).json(group);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }


  deleteById() {
    this.app.delete('/group/:id', async (req, res) => {
      try {
        const deleted = await this.GroupModel.findByIdAndDelete(req.params.id);
        res.status(200).json(deleted || {});
      } catch (err) {
        res.status(500).json({ code: 500, message: 'Internal Server Error' });
      }
    });
  }

  run() {
    this.create();
    this.getAll();
    this.getById();
    this.addMember();
    this.removeMember();
    this.deleteById();
  }
};

export default Groups;
