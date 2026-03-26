export class Post {
    title;
    content;
    authorId;
    tags;

    constructor(title, content, authorId, tags = []) {
        this.title = title;
        this.content = content;
        this.authorId = authorId;
        this.tags = tags;
        this.date = new Date();
    }

    createNewPost()
    {
        return {
            id: Date.now() + Math.floor(Math.random() * 1000),
            title: this.title,
            content: this.content,
            authorId: this.authorId,
            tags: this.tags,
            date: this.date.toISOString().split('T')[0],
            views: "0"
        };
    }
}