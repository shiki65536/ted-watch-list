{
  youtubeId: String (required, unique),
  channel: String (enum: ['ted', 'teded', 'tedx']),
  title: String,
  description: String,
  thumbnail: {
    default: String,
    medium: String,
    high: String
  },
  duration: String,
  publishedAt: Date,
  views: Number,
  likes: Number,
  tags: [String],
  lastUpdated: Date,
  channelTitle: String
}