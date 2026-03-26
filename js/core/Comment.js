class Comment {
    postId;
    authorId;
    text;

    constructor(postId, authorId, text) {
        this.postId = postId;
        this.authorId = authorId;
        this.text = text;
        this.date = new Date();
    }
}