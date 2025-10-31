import CommentModel from '../models/comment.mjs';


const Comments = class Comments {
  constructor(app, connect) {
    this.app = app;
    this.CommentModel = connect.model('Comment', CommentModel);
    this.run();
  }

  addComment() {
    this.app.post('/photo/:id/comment', async (req, res) => {
      try {
        const { author, content } = req.body;
        const comment = new this.CommentModel({
          photo: req.params.id,
          author,
          content
        });
        const saved = await comment.save();
        res.status(201).json(saved);
      } catch (err) {
        res.status(400).json({ code: 400, message: 'Bad Request' });
      }
    });
  }

  run() {
    this.addComment();
  }
};

export default Comments;
