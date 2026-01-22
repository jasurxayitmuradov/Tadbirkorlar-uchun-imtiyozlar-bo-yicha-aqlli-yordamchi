import React from 'react';
import type { Lesson } from '../data/coursesMock';

type VideoPlayerProps = {
  lesson: Lesson;
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({ lesson }) => {
  if (lesson.videoProvider === 'youtube' && lesson.youtubeUrl) {
    const embedUrl = lesson.youtubeUrl.replace('watch?v=', 'embed/').split('&')[0];
    return (
      <div className="w-full aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          className="w-full h-full"
          src={embedUrl}
          title={lesson.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="w-full aspect-video bg-slate-900 border border-white/10 rounded-xl flex items-center justify-center">
      <div className="text-center">
        <p className="text-slate-300 font-medium">Demo video</p>
        <p className="text-xs text-slate-500 mt-1">MVP uchun demo kontent</p>
      </div>
    </div>
  );
};
