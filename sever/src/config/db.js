{
  email: String (required, unique),
  password: String (required, hashed),
  username: String (required),
  favourites: [
    {
      videoId: String,
      addedAt: Date
    }
  ],
  watched: [
    {
      videoId: String,
      watchedAt: Date
    }
  ],
  createdAt: Date,
  updatedAt: Date
}