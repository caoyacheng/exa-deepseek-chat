export interface Article {
  id: string;
  title: string;
  content: string;
  author: string;
  authorImage?: string;
  publication?: string;
  date: string;
  readTime?: string;
  likes?: number;
  comments?: number;
  tags?: string[];
  coverImage?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}
