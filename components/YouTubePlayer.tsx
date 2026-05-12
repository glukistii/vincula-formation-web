'use client';

type Props = {
  videoId: string;
  title?: string;
};

// We use the privacy-enhanced youtube-nocookie.com domain.
// `rel=0` disables related videos at the end, `modestbranding=1` reduces YT branding.
export function YouTubePlayer({ videoId, title }: Props) {
  const src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?rel=0&modestbranding=1&playsinline=1`;
  return (
    <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
      <iframe
        src={src}
        title={title ?? 'Lecteur vidéo'}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
        className="h-full w-full"
      />
    </div>
  );
}
