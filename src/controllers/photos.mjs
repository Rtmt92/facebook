import PhotoModel from '../models/photo.mjs';
import CommentModel from '../models/comment.mjs';

const Photos = class Photos {
  constructor(app, connect) {
    this.app = app;
    this.PhotoModel = connect.model('Photo', PhotoModel);
    this.CommentModel = connect.model('Comment', CommentModel);
    this.run();
  }

  addPhoto() {
    this.app.post('/album/:id/photo', async (req, res) => {
      try {
        const { uploadedBy, url, caption } = req.body;
        const photo = new this.PhotoModel({
          album: req.params.id,
          uploadedBy,
          url,
          caption
        });
        const saved = await photo.save();
        res.status(201).json(saved);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  getComments() {
    this.app.get('/photo/:id/comments', async (req, res) => {
      const comments = await this.CommentModel.find({ photo: req.params.id })
        .populate('author', 'firstname lastname');
      res.status(200).json(comments);
    });
  }

  run() {
    this.addPhoto();
    this.getComments();
  }
};

export default Photos;
