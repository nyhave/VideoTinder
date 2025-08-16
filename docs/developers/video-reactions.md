# Video Reactions

Users can react to individual video clips with either a thumb or a heart.

## Data model
Reactions are stored in the `videoReactions` Firestore collection with the following fields:

- `id`: `${userId}-${videoId}`
- `userId`: identifier of the reacting user
- `videoId`: identifier of the video clip
- `type`: `"thumb"` or `"heart"`

Selecting the same reaction again clears it. Switching between reactions updates the stored `type`.

## UI
The `VideoLikeButton` component renders two buttons below each video:

- **Thumbs up** – blue background when selected
- **Heart** – pink background when selected

Both buttons explicitly set text colors to maintain contrast against their backgrounds.
